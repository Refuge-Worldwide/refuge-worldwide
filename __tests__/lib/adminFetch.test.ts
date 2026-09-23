import { describe, expect, it } from "vitest";
import { isContentfulAuthError } from "@/lib/contentful/adminFetch";

describe("isContentfulAuthError", () => {
  it("spots contentful-management's invalid-token error", () => {
    expect(isContentfulAuthError({ name: "AccessTokenInvalid" })).toBe(true);
    expect(
      isContentfulAuthError({
        name: "401 Unauthorized",
        message: '{\n  "status": 401\n}',
      })
    ).toBe(true);
  });

  it("ignores other failures", () => {
    expect(isContentfulAuthError({ name: "VersionMismatch" })).toBe(false);
    expect(isContentfulAuthError(new Error("network"))).toBe(false);
    expect(isContentfulAuthError(undefined)).toBe(false);
  });
});
