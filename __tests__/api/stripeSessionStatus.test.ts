import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { createApiMocks } from "../helpers/createApiMocks";
import sessionStatusHandler from "@/pages/api/stripe/session-status";
import { stripe } from "@/lib/stripe/config";
import { findUserByEmail } from "@/lib/membership";

vi.mock("@/lib/stripe/config", () => ({
  stripe: { checkout: { sessions: { retrieve: vi.fn() } } },
}));

vi.mock("@/lib/membership", () => ({
  findUserByEmail: vi.fn(),
}));

const mockRetrieve = stripe.checkout.sessions.retrieve as Mock;
const mockFindUserByEmail = findUserByEmail as Mock;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/stripe/session-status", () => {
  it("rejects non-GET methods", async () => {
    const { req, res } = createApiMocks({ method: "POST" });
    await sessionStatusHandler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  it("400s when session_id is missing", async () => {
    const { req, res } = createApiMocks({ method: "GET", query: {} });
    await sessionStatusHandler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it("400s when the session hasn't been paid", async () => {
    mockRetrieve.mockResolvedValueOnce({ payment_status: "unpaid" });
    const { req, res } = createApiMocks({
      method: "GET",
      query: { session_id: "cs_1" },
    });
    await sessionStatusHandler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(mockFindUserByEmail).not.toHaveBeenCalled();
  });

  it("400s when the session has no email", async () => {
    mockRetrieve.mockResolvedValueOnce({
      payment_status: "paid",
      customer_details: null,
    });
    const { req, res } = createApiMocks({
      method: "GET",
      query: { session_id: "cs_1" },
    });
    await sessionStatusHandler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it("reports hasAccount: false for a brand new supporter", async () => {
    mockRetrieve.mockResolvedValueOnce({
      payment_status: "paid",
      customer_details: { email: "new@b.com" },
    });
    mockFindUserByEmail.mockResolvedValueOnce(null);

    const { req, res } = createApiMocks({
      method: "GET",
      query: { session_id: "cs_1" },
    });
    await sessionStatusHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      email: "new@b.com",
      hasAccount: false,
    });
  });

  it("reports hasAccount: true when the existing user has already completed setup", async () => {
    mockRetrieve.mockResolvedValueOnce({
      payment_status: "paid",
      customer_details: { email: "existing@b.com" },
    });
    mockFindUserByEmail.mockResolvedValueOnce({
      id: "user-1",
      status: "active",
    });

    const { req, res } = createApiMocks({
      method: "GET",
      query: { session_id: "cs_1" },
    });
    await sessionStatusHandler(req, res);

    expect(res._getJSONData()).toEqual({
      email: "existing@b.com",
      hasAccount: true,
    });
  });

  it("reports hasAccount: false when the user exists but never completed setup (e.g. the webhook's silent fallback)", async () => {
    mockRetrieve.mockResolvedValueOnce({
      payment_status: "paid",
      customer_details: { email: "incomplete@b.com" },
    });
    mockFindUserByEmail.mockResolvedValueOnce({
      id: "user-2",
      status: "invited",
    });

    const { req, res } = createApiMocks({
      method: "GET",
      query: { session_id: "cs_1" },
    });
    await sessionStatusHandler(req, res);

    expect(res._getJSONData()).toEqual({
      email: "incomplete@b.com",
      hasAccount: false,
    });
  });

  it("400s when Stripe lookup throws", async () => {
    mockRetrieve.mockRejectedValueOnce(new Error("stripe down"));
    const { req, res } = createApiMocks({
      method: "GET",
      query: { session_id: "cs_1" },
    });
    await sessionStatusHandler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });
});
