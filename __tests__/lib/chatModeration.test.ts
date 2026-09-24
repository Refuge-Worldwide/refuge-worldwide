import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { readItems } from "@directus/sdk";
import { directusServer } from "@/lib/directus/server";
import { checkRateLimit, moderateMessageText } from "@/lib/chatModeration";

vi.mock("@/lib/directus/server", () => ({
  directusServer: { request: vi.fn() },
}));
vi.mock("@directus/sdk", () => ({
  readItems: vi.fn((collection, query) => ({
    __op: "readItems",
    collection,
    query,
  })),
}));

const mockRequest = directusServer.request as Mock;

describe("moderateMessageText", () => {
  it("allows an ordinary message", () => {
    expect(moderateMessageText("looking forward to tonight's show")).toEqual({
      ok: true,
    });
  });

  it("blocks profanity", () => {
    const result = moderateMessageText("this is shit");
    expect(result.ok).toBe(false);
  });

  it("blocks profanity disguised with a substituted character", () => {
    const result = moderateMessageText("f*ck this");
    expect(result.ok).toBe(false);
  });

  it("blocks profanity split by spaces", () => {
    expect(moderateMessageText("f u c k this").ok).toBe(false);
  });

  it("blocks profanity split by dashes", () => {
    expect(moderateMessageText("f-u-c-k this").ok).toBe(false);
  });

  it("does not collapse ordinary sentences with short words", () => {
    expect(moderateMessageText("I am so happy right now")).toEqual({
      ok: true,
    });
  });

  it("does not collapse a hyphenated real word", () => {
    expect(moderateMessageText("send me an e-mail please")).toEqual({
      ok: true,
    });
  });

  it("blocks profanity disguised with zero-width characters", () => {
    const result = moderateMessageText("f​u​c​k this");
    expect(result.ok).toBe(false);
  });

  it("blocks a long message that is only symbols/emoji", () => {
    const result = moderateMessageText("!!!!!!!!!!!!!!!!!!!!");
    expect(result.ok).toBe(false);
  });

  it("blocks a long message that is only emoji", () => {
    const result = moderateMessageText("🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥");
    expect(result.ok).toBe(false);
  });

  it("allows a short emoji reaction", () => {
    expect(moderateMessageText("🔥🔥🔥")).toEqual({ ok: true });
  });

  it("allows a message that mixes symbols with real words", () => {
    expect(moderateMessageText("!!! amazing set tonight !!!")).toEqual({
      ok: true,
    });
  });
});

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows a signed-in sender under the limit", async () => {
    mockRequest.mockResolvedValueOnce([{ message: "hi" }]);
    const result = await checkRateLimit("user-1", true, "new message");
    expect(result).toEqual({ ok: true });
    expect(readItems).toHaveBeenCalledWith(
      "chat",
      expect.objectContaining({
        filter: expect.objectContaining({
          _and: expect.arrayContaining([{ user: { _eq: "user-1" } }]),
        }),
      })
    );
  });

  it("filters by username for an anonymous sender", async () => {
    mockRequest.mockResolvedValueOnce([]);
    await checkRateLimit("some-guest", false, "hello");
    expect(readItems).toHaveBeenCalledWith(
      "chat",
      expect.objectContaining({
        filter: expect.objectContaining({
          _and: expect.arrayContaining([{ username: { _eq: "some-guest" } }]),
        }),
      })
    );
  });

  it("rejects once the sender hits the message cap", async () => {
    mockRequest.mockResolvedValueOnce([
      { message: "a" },
      { message: "b" },
      { message: "c" },
    ]);
    const result = await checkRateLimit("user-1", true, "d");
    expect(result.ok).toBe(false);
  });

  it("rejects an exact repeat of the most recent message", async () => {
    mockRequest.mockResolvedValueOnce([{ message: "same message" }]);
    const result = await checkRateLimit("user-1", true, "same message");
    expect(result.ok).toBe(false);
  });

  it("allows a different message even if a recent one matches something older", async () => {
    mockRequest.mockResolvedValueOnce([
      { message: "newest" },
      { message: "same message" },
    ]);
    const result = await checkRateLimit("user-1", true, "same message");
    expect(result).toEqual({ ok: true });
  });
});
