import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { readItems } from "@directus/sdk";
import { directusServer } from "@/lib/directus/server";
import {
  checkAnonymousSurge,
  checkImageRateLimit,
  checkRateLimit,
  hashSenderIp,
  isBlockedUsername,
  moderateMessageText,
} from "@/lib/chatModeration";

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

const now = () => new Date().toISOString();
const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

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

  it("blocks the known spam message", () => {
    expect(
      moderateMessageText(
        "spammed by pnt. join https://discord.me/pixlmo0n 82372"
      ).ok
    ).toBe(false);
  });

  it("blocks the spam phrase with spacing tricks", () => {
    expect(moderateMessageText("S P A M M E D  b-y  p.n.t").ok).toBe(false);
  });

  it("blocks discord invite links", () => {
    expect(moderateMessageText("come hang discord.gg/abc123").ok).toBe(false);
    expect(moderateMessageText("discord . me / xyz").ok).toBe(false);
  });

  it("still allows talking about discord", () => {
    expect(moderateMessageText("is there a refuge discord?")).toEqual({
      ok: true,
    });
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
    mockRequest.mockResolvedValueOnce([{ message: "hi", date_created: now() }]);
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

  it("filters by IP hash for an anonymous sender", async () => {
    mockRequest.mockResolvedValueOnce([]);
    await checkRateLimit("hash-1", false, "hello");
    expect(readItems).toHaveBeenCalledWith(
      "chat",
      expect.objectContaining({
        filter: expect.objectContaining({
          _and: expect.arrayContaining([{ sender_hash: { _eq: "hash-1" } }]),
        }),
      })
    );
  });

  it("rejects an anonymous IP that's sent too many in a few minutes", async () => {
    mockRequest.mockResolvedValueOnce(
      Array.from({ length: 20 }, (_, i) => ({
        message: `msg ${i}`,
        date_created: minutesAgo(1 + i * 0.4),
      }))
    );
    const result = await checkRateLimit("hash-1", false, "another");
    expect(result.ok).toBe(false);
  });

  it("allows an anonymous IP chatting at a normal pace", async () => {
    mockRequest.mockResolvedValueOnce(
      Array.from({ length: 6 }, (_, i) => ({
        message: `msg ${i}`,
        date_created: minutesAgo(1 + i),
      }))
    );
    const result = await checkRateLimit("hash-1", false, "another");
    expect(result).toEqual({ ok: true });
  });

  it("allows repeating a short message that wasn't just sent", async () => {
    mockRequest.mockResolvedValueOnce([
      { message: "lol", date_created: minutesAgo(3) },
    ]);
    const result = await checkRateLimit("hash-1", false, "lol");
    expect(result).toEqual({ ok: true });
  });

  it("rejects a third anonymous message inside 15 seconds", async () => {
    mockRequest.mockResolvedValueOnce([
      { message: "a", date_created: now(), username: "dj" },
      { message: "b", date_created: now(), username: "dj" },
    ]);
    const result = await checkRateLimit("hash-1", false, "c", "dj");
    expect(result.ok).toBe(false);
  });

  it("rejects a sixth anonymous message in three minutes, even when spaced out", async () => {
    mockRequest.mockResolvedValueOnce(
      Array.from({ length: 5 }, (_, i) => ({
        message: `msg ${i}`,
        date_created: minutesAgo(0.5 + i * 0.5),
        username: "dj",
      }))
    );
    const result = await checkRateLimit("hash-1", false, "another", "dj");
    expect(result.ok).toBe(false);
  });

  it("allows an anonymous chatter whose earlier messages are over three minutes old", async () => {
    mockRequest.mockResolvedValueOnce(
      Array.from({ length: 8 }, (_, i) => ({
        message: `msg ${i}`,
        date_created: minutesAgo(3.5 + i),
        username: "dj",
      }))
    );
    const result = await checkRateLimit("hash-1", false, "another", "dj");
    expect(result).toEqual({ ok: true });
  });

  it("rejects an anonymous IP switching to a third name within the hour", async () => {
    mockRequest.mockResolvedValueOnce([
      { message: "a", date_created: minutesAgo(5), username: "bot 1" },
      { message: "b", date_created: minutesAgo(10), username: "bot 2" },
    ]);
    const result = await checkRateLimit("hash-1", false, "c", "bot 3");
    expect(result.ok).toBe(false);
  });

  it("lets an anonymous IP keep using a name it already used", async () => {
    mockRequest.mockResolvedValueOnce([
      { message: "a", date_created: minutesAgo(5), username: "dj" },
      { message: "b", date_created: minutesAgo(10), username: "dj2" },
    ]);
    const result = await checkRateLimit("hash-1", false, "c", "dj");
    expect(result).toEqual({ ok: true });
  });

  it("allows a second name on the same IP, e.g. two people on one wifi", async () => {
    mockRequest.mockResolvedValueOnce([
      { message: "a", date_created: minutesAgo(5), username: "dj" },
    ]);
    const result = await checkRateLimit("hash-1", false, "b", "friend");
    expect(result).toEqual({ ok: true });
  });

  it("rejects once the sender hits the message cap", async () => {
    mockRequest.mockResolvedValueOnce([
      { message: "a", date_created: now() },
      { message: "b", date_created: now() },
      { message: "c", date_created: now() },
    ]);
    const result = await checkRateLimit("user-1", true, "d");
    expect(result.ok).toBe(false);
  });

  it("rejects an exact repeat of the most recent message", async () => {
    mockRequest.mockResolvedValueOnce([
      { message: "same message", date_created: now() },
    ]);
    const result = await checkRateLimit("user-1", true, "same message");
    expect(result.ok).toBe(false);
  });

  it("allows a different message even if a recent one matches something older", async () => {
    mockRequest.mockResolvedValueOnce([
      { message: "newest", date_created: now() },
      { message: "same message", date_created: now() },
    ]);
    const result = await checkRateLimit("user-1", true, "same message");
    expect(result).toEqual({ ok: true });
  });

  it("doesn't treat two photo-only messages as a repeat", async () => {
    mockRequest.mockResolvedValueOnce([{ message: "", date_created: now() }]);
    const result = await checkRateLimit("user-1", true, "");
    expect(result).toEqual({ ok: true });
  });
});

describe("checkImageRateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows a photo when none were sent recently", async () => {
    mockRequest.mockResolvedValueOnce([]);
    const result = await checkImageRateLimit("hash-1", false);
    expect(result).toEqual({ ok: true });
    expect(readItems).toHaveBeenCalledWith(
      "chat",
      expect.objectContaining({
        filter: expect.objectContaining({
          _and: expect.arrayContaining([
            { sender_hash: { _eq: "hash-1" } },
            { image: { _nnull: true } },
          ]),
        }),
      })
    );
  });

  it("rejects a second photo inside the window", async () => {
    mockRequest.mockResolvedValueOnce([{ id: 1 }]);
    const result = await checkImageRateLimit("user-1", true);
    expect(result.ok).toBe(false);
  });
});

describe("checkAnonymousSurge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const rows = (count: number, senders: number) =>
    Array.from({ length: count }, (_, i) => ({
      sender_hash: `other-${i % senders}`,
      date_created: now(),
    }));

  it("lets an established anonymous chatter straight through", async () => {
    mockRequest.mockResolvedValueOnce([{ id: 1 }]);
    expect(await checkAnonymousSurge("hash-1")).toEqual({ ok: true });
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it("lets a new sender in while anonymous traffic is normal", async () => {
    mockRequest.mockResolvedValueOnce([]).mockResolvedValueOnce(rows(6, 3));
    expect(await checkAnonymousSurge("hash-1")).toEqual({ ok: true });
  });

  it("holds back a new sender during a message surge", async () => {
    mockRequest.mockResolvedValueOnce([]).mockResolvedValueOnce(rows(30, 3));
    expect((await checkAnonymousSurge("hash-1")).ok).toBe(false);
  });

  it("holds back a new sender when lots of new IPs turned up at once", async () => {
    mockRequest
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(rows(12, 6))
      .mockResolvedValueOnce([]);
    expect((await checkAnonymousSurge("hash-1")).ok).toBe(false);
  });

  it("doesn't count established chatters as new IPs", async () => {
    mockRequest
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(rows(12, 6))
      .mockResolvedValueOnce([
        { sender_hash: "other-0" },
        { sender_hash: "other-1" },
      ]);
    expect(await checkAnonymousSurge("hash-1")).toEqual({ ok: true });
  });

  it("keeps letting in a new sender who already got in this window", async () => {
    mockRequest
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        ...rows(12, 6),
        { sender_hash: "hash-1", date_created: now() },
      ]);
    expect(await checkAnonymousSurge("hash-1")).toEqual({ ok: true });
  });
});

describe("hashSenderIp", () => {
  it("doesn't contain the IP", () => {
    expect(hashSenderIp("203.0.113.7")).not.toContain("203");
  });

  it("treats an IPv4-mapped address like plain IPv4", () => {
    expect(hashSenderIp("::ffff:203.0.113.7")).toBe(
      hashSenderIp("203.0.113.7")
    );
  });

  it("groups an IPv6 /64 together", () => {
    expect(hashSenderIp("2001:db8:1:2::1")).toBe(
      hashSenderIp("2001:db8:1:2:aaaa:bbbb:cccc:dddd")
    );
    expect(hashSenderIp("2001:db8:1:2::1")).not.toBe(
      hashSenderIp("2001:db8:1:3::1")
    );
  });
});

describe("isBlockedUsername", () => {
  it("blocks the spam bot's names", () => {
    expect(isBlockedUsername("bot 65022")).toBe(true);
    expect(isBlockedUsername("BOT65022")).toBe(true);
  });

  it("allows ordinary names, including ones with bot in them", () => {
    expect(isBlockedUsername("robotnik")).toBe(false);
    expect(isBlockedUsername("bot fan")).toBe(false);
    expect(isBlockedUsername("dj bot 3")).toBe(false);
  });
});
