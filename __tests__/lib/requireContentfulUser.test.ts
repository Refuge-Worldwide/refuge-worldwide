import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { createApiMocks } from "../helpers/createApiMocks";
import { requireContentfulUser } from "@/lib/contentful/requireContentfulUser";

beforeEach(() => {
  process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID = "space-1";
  global.fetch = vi.fn();
});

function withAuth(header?: string) {
  const { req, res } = createApiMocks({ method: "GET" });
  if (header) req.headers.authorization = header;
  return { req, res };
}

describe("requireContentfulUser", () => {
  it("401s without a bearer token and never calls Contentful", async () => {
    const { req, res } = withAuth();
    expect(await requireContentfulUser(req, res)).toBe(false);
    expect(res._getStatusCode()).toBe(401);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("checks the token against our space", async () => {
    (global.fetch as Mock).mockResolvedValueOnce({ ok: true });
    const { req, res } = withAuth("Bearer user-token");

    expect(await requireContentfulUser(req, res)).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.contentful.com/spaces/space-1",
      { headers: { Authorization: "Bearer user-token" } }
    );
  });

  it.each([401, 404])("401s when Contentful answers %i", async (status) => {
    (global.fetch as Mock).mockResolvedValueOnce({ ok: false, status });
    const { req, res } = withAuth("Bearer other-space-token");

    expect(await requireContentfulUser(req, res)).toBe(false);
    expect(res._getStatusCode()).toBe(401);
  });

  it("503s (not 401) when Contentful can't be reached", async () => {
    (global.fetch as Mock).mockRejectedValueOnce(new Error("network"));
    const { req, res } = withAuth("Bearer user-token");

    expect(await requireContentfulUser(req, res)).toBe(false);
    expect(res._getStatusCode()).toBe(503);
  });
});
