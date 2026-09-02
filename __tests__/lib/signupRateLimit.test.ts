import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { readUsers } from "@directus/sdk";
import { directusMembershipAdmin } from "@/lib/directus/admin";
import { checkSignupRateLimit, getClientIp } from "@/lib/signupRateLimit";

vi.mock("@/lib/directus/admin", () => ({
  directusMembershipAdmin: { request: vi.fn() },
}));

vi.mock("@directus/sdk", () => ({
  readUsers: vi.fn((query) => ({ __op: "readUsers", query })),
}));

const mockRequest = directusMembershipAdmin.request as Mock;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("checkSignupRateLimit", () => {
  it("fails open (ok: true) when no IP is available to key on", async () => {
    const result = await checkSignupRateLimit(null);
    expect(result).toEqual({ ok: true });
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("allows the signup when under the threshold", async () => {
    mockRequest.mockResolvedValueOnce([{ id: "u1" }]);
    const result = await checkSignupRateLimit("1.2.3.4");
    expect(result).toEqual({ ok: true });
    expect(readUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: expect.objectContaining({
          signup_ip: { _eq: "1.2.3.4" },
        }),
      })
    );
  });

  it("rejects once the same IP has hit the threshold within the window", async () => {
    mockRequest.mockResolvedValueOnce([
      { id: "u1" },
      { id: "u2" },
      { id: "u3" },
    ]);
    const result = await checkSignupRateLimit("1.2.3.4");
    expect(result.ok).toBe(false);
  });
});

describe("getClientIp", () => {
  it("prefers x-forwarded-for, taking the first entry", () => {
    const ip = getClientIp({
      headers: { "x-forwarded-for": "9.9.9.9, 1.1.1.1" },
    });
    expect(ip).toBe("9.9.9.9");
  });

  it("handles x-forwarded-for as an array", () => {
    const ip = getClientIp({ headers: { "x-forwarded-for": ["8.8.8.8"] } });
    expect(ip).toBe("8.8.8.8");
  });

  it("falls back to the socket's remoteAddress", () => {
    const ip = getClientIp({
      headers: {},
      socket: { remoteAddress: "127.0.0.1" },
    });
    expect(ip).toBe("127.0.0.1");
  });

  it("returns null when nothing is available", () => {
    const ip = getClientIp({ headers: {} });
    expect(ip).toBeNull();
  });
});
