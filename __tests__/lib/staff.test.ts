import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { getStaffUser, getUserAccess } from "@/lib/directus/staff";
import { getSessionUser } from "@/lib/directus/session";
import { directusMembershipAdmin } from "@/lib/directus/admin";

vi.mock("@/lib/directus/session", () => ({
  directusUrl: "https://directus.test",
  getSessionUser: vi.fn(),
}));
vi.mock("@/lib/directus/admin", () => ({
  directusMembershipAdmin: { request: vi.fn() },
}));
vi.mock("@directus/sdk", () => ({
  readUser: vi.fn((id, query) => ({ __op: "readUser", id, query })),
}));

const mockSession = getSessionUser as Mock;
const mockAdmin = directusMembershipAdmin.request as Mock;
const req = { cookies: {} };
const res = { setHeader: vi.fn() };

beforeEach(() => {
  vi.clearAllMocks();
  process.env.DIRECTUS_STAFF_ROLE_ID = "staff-role";
  process.env.DIRECTUS_ADMIN_ROLE_ID = "admin-role";
});

describe("getUserAccess", () => {
  it("gives staff supporter access without a subscription", async () => {
    mockAdmin.mockResolvedValueOnce({
      role: "staff-role",
      subscription_status: null,
    });
    expect(await getUserAccess("u1")).toEqual({
      isStaff: true,
      isPaid: false,
      hasSupporterAccess: true,
    });
  });

  it("gives admins staff and supporter access", async () => {
    mockAdmin.mockResolvedValueOnce({
      role: "admin-role",
      subscription_status: null,
    });
    expect(await getUserAccess("u2")).toMatchObject({
      isStaff: true,
      hasSupporterAccess: true,
    });
  });

  it("gives paid supporters access but not staff", async () => {
    mockAdmin.mockResolvedValueOnce({
      role: "supporter-role",
      subscription_status: "active",
    });
    expect(await getUserAccess("u3")).toEqual({
      isStaff: false,
      isPaid: true,
      hasSupporterAccess: true,
    });
  });

  it("treats past_due as still paid", async () => {
    mockAdmin.mockResolvedValueOnce({
      role: "supporter-role",
      subscription_status: "past_due",
    });
    expect((await getUserAccess("u3")).hasSupporterAccess).toBe(true);
  });

  it("gives unpaid, non-staff users nothing", async () => {
    mockAdmin.mockResolvedValueOnce({
      role: "supporter-role",
      subscription_status: "incomplete",
    });
    expect(await getUserAccess("u4")).toEqual({
      isStaff: false,
      isPaid: false,
      hasSupporterAccess: false,
    });
  });

  it("nobody is staff if the role ids aren't configured", async () => {
    delete process.env.DIRECTUS_STAFF_ROLE_ID;
    delete process.env.DIRECTUS_ADMIN_ROLE_ID;
    mockAdmin.mockResolvedValueOnce({
      role: "staff-role",
      subscription_status: null,
    });
    expect((await getUserAccess("u1")).isStaff).toBe(false);
  });
});

describe("getStaffUser", () => {
  it("returns the session user when they are staff", async () => {
    mockSession.mockResolvedValueOnce({ id: "u1", email: "a@b.com" });
    mockAdmin.mockResolvedValueOnce({
      role: "staff-role",
      subscription_status: null,
    });
    expect(await getStaffUser(req, res)).toEqual({
      id: "u1",
      email: "a@b.com",
    });
  });

  it("returns null for a paid supporter who isn't staff", async () => {
    mockSession.mockResolvedValueOnce({ id: "u3", email: "c@d.com" });
    mockAdmin.mockResolvedValueOnce({
      role: "supporter-role",
      subscription_status: "active",
    });
    expect(await getStaffUser(req, res)).toBeNull();
  });

  it("returns null when nobody is signed in", async () => {
    mockSession.mockResolvedValueOnce(null);
    expect(await getStaffUser(req, res)).toBeNull();
    expect(mockAdmin).not.toHaveBeenCalled();
  });
});
