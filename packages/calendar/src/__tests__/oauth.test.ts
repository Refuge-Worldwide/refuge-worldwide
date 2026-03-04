// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from "vitest";
import {
  parseCallbackHash,
  buildAuthUrl,
  storeToken,
  getStoredToken,
  clearStoredToken,
  getTokenTTL,
} from "../lib/oauth";

const STORAGE_KEY = "contentful_oauth_token";
const EXPIRY_KEY = "contentful_oauth_token_expiry";

// ── parseCallbackHash ─────────────────────────────────────────────────────────

describe("parseCallbackHash", () => {
  it("parses a valid OAuth callback hash", () => {
    const result = parseCallbackHash(
      "#access_token=abc123&token_type=Bearer&expires_in=86400"
    );
    expect(result).toEqual({ accessToken: "abc123", expiresIn: 86400 });
  });

  it("returns null for an empty string", () => {
    expect(parseCallbackHash("")).toBeNull();
  });

  it("returns null when access_token is absent", () => {
    expect(parseCallbackHash("#token_type=Bearer&expires_in=86400")).toBeNull();
  });

  it("strips the leading # before parsing", () => {
    const result = parseCallbackHash("#access_token=mytoken&expires_in=3600");
    expect(result?.accessToken).toBe("mytoken");
  });

  it("defaults expiresIn to 86400 when the param is missing", () => {
    const result = parseCallbackHash("#access_token=tok");
    expect(result?.expiresIn).toBe(86400);
  });

  it("parses a hash without a leading #", () => {
    const result = parseCallbackHash("access_token=tok&expires_in=7200");
    expect(result?.accessToken).toBe("tok");
    expect(result?.expiresIn).toBe(7200);
  });
});

// ── buildAuthUrl ──────────────────────────────────────────────────────────────

describe("buildAuthUrl", () => {
  it("includes the client ID", () => {
    const url = buildAuthUrl({
      clientId: "my-client",
      redirectUri: "https://example.com/callback",
    });
    expect(url).toContain("client_id=my-client");
  });

  it("uses implicit grant (response_type=token)", () => {
    const url = buildAuthUrl({
      clientId: "c",
      redirectUri: "https://example.com",
    });
    expect(url).toContain("response_type=token");
  });

  it("includes the redirect URI", () => {
    const url = buildAuthUrl({
      clientId: "c",
      redirectUri: "https://mysite.com/admin/calendar",
    });
    expect(url).toContain(
      encodeURIComponent("https://mysite.com/admin/calendar")
    );
  });

  it("defaults scope to content_management_manage", () => {
    const url = buildAuthUrl({ clientId: "c", redirectUri: "https://r.com" });
    expect(url).toContain("scope=content_management_manage");
  });

  it("uses a custom scope when provided", () => {
    const url = buildAuthUrl({
      clientId: "c",
      redirectUri: "https://r.com",
      scope: "content_management_read",
    });
    expect(url).toContain("scope=content_management_read");
  });

  it("points to the Contentful OAuth endpoint", () => {
    const url = buildAuthUrl({ clientId: "c", redirectUri: "https://r.com" });
    expect(url).toContain("be.contentful.com/oauth/authorize");
  });
});

// ── storeToken / getStoredToken / clearStoredToken ────────────────────────────

describe("token storage", () => {
  beforeEach(() => localStorage.clear());

  it("stores and retrieves a valid token", () => {
    storeToken("mytoken", 3600);
    expect(getStoredToken()).toBe("mytoken");
  });

  it("returns null when no token is stored", () => {
    expect(getStoredToken()).toBeNull();
  });

  it("returns null when the token has expired", () => {
    // store with expiry already in the past
    localStorage.setItem(STORAGE_KEY, "oldtoken");
    localStorage.setItem(EXPIRY_KEY, String(Date.now() - 1000));
    expect(getStoredToken()).toBeNull();
  });

  it("returns null when the token is within the 5-minute buffer window", () => {
    // expires in 4 minutes — within the 5-minute safety buffer
    storeToken("expiring", 4 * 60);
    expect(getStoredToken()).toBeNull();
  });

  it("returns the token when it has plenty of time remaining", () => {
    storeToken("freshtoken", 7200);
    expect(getStoredToken()).toBe("freshtoken");
  });

  it("cleans up storage when an expired token is accessed", () => {
    localStorage.setItem(STORAGE_KEY, "old");
    localStorage.setItem(EXPIRY_KEY, String(Date.now() - 1000));
    getStoredToken();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(EXPIRY_KEY)).toBeNull();
  });

  it("clearStoredToken removes both keys", () => {
    storeToken("tok", 3600);
    clearStoredToken();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(EXPIRY_KEY)).toBeNull();
  });
});

// ── getTokenTTL ───────────────────────────────────────────────────────────────

describe("getTokenTTL", () => {
  beforeEach(() => localStorage.clear());

  it("returns 0 when no token is stored", () => {
    expect(getTokenTTL()).toBe(0);
  });

  it("returns approximate seconds remaining for a valid token", () => {
    storeToken("tok", 3600);
    const ttl = getTokenTTL();
    expect(ttl).toBeGreaterThan(3550);
    expect(ttl).toBeLessThanOrEqual(3600);
  });

  it("returns 0 when the token has already expired", () => {
    localStorage.setItem(EXPIRY_KEY, String(Date.now() - 5000));
    expect(getTokenTTL()).toBe(0);
  });
});
