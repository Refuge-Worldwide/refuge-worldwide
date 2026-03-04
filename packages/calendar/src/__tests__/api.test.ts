import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  calendarHandler,
  calendarSearchHandler,
  getShowsNeedingReminders,
} from "../api/index";
import {
  testConfig,
  makeRawShow,
  CAL_START,
  CAL_END,
  REMINDER_BASE,
  REMINDER_SHOW_DATE,
} from "./helpers";

// Mock the entire queries module so API handlers don't make real network calls
vi.mock("../lib/queries", () => ({
  buildCalendarQuery: vi.fn(() => "mock-calendar-query"),
  buildSearchQuery: vi.fn(() => "mock-search-query"),
  buildArtistSearchQuery: vi.fn(() => "mock-artist-query"),
  buildSingleParticipantSearchQuery: vi.fn(() => "mock-participant-query"),
  executeGraphQL: vi.fn(),
  extractItems: vi.fn(),
  processShow: vi.fn(),
}));

import * as queries from "../lib/queries";

function mockReq(opts: {
  method?: string;
  query?: Record<string, string>;
  body?: unknown;
}) {
  return {
    method: opts.method ?? "GET",
    query: opts.query ?? {},
    body: opts.body ?? {},
  };
}

function mockRes() {
  const res = {
    _status: 200,
    _body: null as unknown,
    status: vi.fn(),
    json: vi.fn(),
    setHeader: vi.fn(),
  };
  res.status.mockReturnValue(res);
  res.setHeader.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}

// ── calendarHandler ───────────────────────────────────────────────────────────

describe("calendarHandler", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 405 for non-GET requests", async () => {
    const handler = calendarHandler(testConfig);
    const res = mockRes();
    await handler(mockReq({ method: "POST" }) as any, res as any);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it("returns 400 when start query param is missing", async () => {
    const handler = calendarHandler(testConfig);
    const res = mockRes();
    await handler(mockReq({ query: { end: CAL_END } }) as any, res as any);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 when end query param is missing", async () => {
    const handler = calendarHandler(testConfig);
    const res = mockRes();
    await handler(mockReq({ query: { start: CAL_START } }) as any, res as any);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns processed shows on success", async () => {
    const mockShow = { id: "s1", title: "Test" };
    vi.mocked(queries.executeGraphQL).mockResolvedValue({});
    vi.mocked(queries.extractItems).mockReturnValue([makeRawShow()]);
    vi.mocked(queries.processShow).mockReturnValue(mockShow as any);

    const handler = calendarHandler(testConfig);
    const res = mockRes();
    await handler(
      mockReq({ query: { start: CAL_START, end: CAL_END } }) as any,
      res as any
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ processed: [mockShow] });
  });

  it("returns 400 when executeGraphQL throws", async () => {
    vi.mocked(queries.executeGraphQL).mockRejectedValue(
      new Error("Contentful error")
    );

    const handler = calendarHandler(testConfig);
    const res = mockRes();
    await handler(
      mockReq({ query: { start: CAL_START, end: CAL_END } }) as any,
      res as any
    );

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// ── calendarSearchHandler ─────────────────────────────────────────────────────

describe("calendarSearchHandler", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 405 for non-GET requests", async () => {
    const handler = calendarSearchHandler(testConfig);
    const res = mockRes();
    await handler(mockReq({ method: "DELETE" }) as any, res as any);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it("searches shows by default (no type param)", async () => {
    vi.mocked(queries.executeGraphQL).mockResolvedValue({});
    vi.mocked(queries.extractItems).mockReturnValue([]);
    vi.mocked(queries.processShow).mockReturnValue({} as any);

    const handler = calendarSearchHandler(testConfig);
    const res = mockRes();
    await handler(mockReq({ query: { query: "jazz" } }) as any, res as any);

    expect(queries.buildSearchQuery).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("searches artists when type=artists", async () => {
    vi.mocked(queries.executeGraphQL).mockResolvedValue({
      artistCollection: {
        items: [{ sys: { id: "a1" }, name: "DJ Test", email: ["dj@test.com"] }],
      },
    });

    const handler = calendarSearchHandler(testConfig);
    const res = mockRes();
    await handler(
      mockReq({ query: { query: "test", type: "artists" } }) as any,
      res as any
    );

    // ?type=artists now routes through buildSingleParticipantSearchQuery
    expect(queries.buildSingleParticipantSearchQuery).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith([
      {
        value: "a1",
        label: "DJ Test",
        email: ["dj@test.com"],
        sourceField: "artists",
      },
    ]);
  });

  it("returns empty array when artist search finds nothing", async () => {
    vi.mocked(queries.executeGraphQL).mockResolvedValue({
      artistCollection: { items: [] },
    });

    const handler = calendarSearchHandler(testConfig);
    const res = mockRes();
    await handler(
      mockReq({ query: { query: "noresult", type: "artists" } }) as any,
      res as any
    );

    expect(res.json).toHaveBeenCalledWith([]);
  });

  it("returns 400 when query throws", async () => {
    vi.mocked(queries.executeGraphQL).mockRejectedValue(new Error("fail"));

    const handler = calendarSearchHandler(testConfig);
    const res = mockRes();
    await handler(mockReq({ query: { query: "test" } }) as any, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// ── getShowsNeedingReminders ──────────────────────────────────────────────────

describe("getShowsNeedingReminders", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns an empty shows array when no shows match the window", async () => {
    vi.mocked(queries.executeGraphQL).mockResolvedValue({});
    vi.mocked(queries.extractItems).mockReturnValue([]);

    const result = await getShowsNeedingReminders(testConfig, {
      dayWindows: [7],
      date: REMINDER_BASE,
    });

    expect(result).toEqual([{ daysBefore: 7, shows: [] }]);
  });

  it("returns one ReminderTarget per day window", async () => {
    vi.mocked(queries.executeGraphQL).mockResolvedValue({});
    vi.mocked(queries.extractItems).mockReturnValue([]);

    const result = await getShowsNeedingReminders(testConfig, {
      dayWindows: [7, 1],
      date: REMINDER_BASE,
    });

    expect(result).toHaveLength(2);
    expect(result[0].daysBefore).toBe(7);
    expect(result[1].daysBefore).toBe(1);
  });

  it("only includes confirmed shows", async () => {
    const confirmedShow = makeRawShow({
      status: "Confirmed",
      date: REMINDER_SHOW_DATE,
    });
    const tbcShow = makeRawShow({
      status: "TBC",
      date: REMINDER_SHOW_DATE,
    });

    vi.mocked(queries.executeGraphQL).mockResolvedValue({});
    vi.mocked(queries.extractItems).mockReturnValue([confirmedShow, tbcShow]);

    const result = await getShowsNeedingReminders(testConfig, {
      dayWindows: [7],
      date: REMINDER_BASE,
    });

    expect(result[0].shows).toHaveLength(1);
    expect(result[0].shows[0].id).toBe("show-1");
  });

  it("maps show to ShowNotificationData shape", async () => {
    const show = makeRawShow({
      status: "Confirmed",
      date: REMINDER_SHOW_DATE,
      title: "Test Show",
      artists: {
        items: [{ sys: { id: "a1" }, name: "DJ Test", email: ["dj@test.com"] }],
      },
    });

    vi.mocked(queries.executeGraphQL).mockResolvedValue({});
    vi.mocked(queries.extractItems).mockReturnValue([show]);

    const result = await getShowsNeedingReminders(testConfig, {
      dayWindows: [7],
      date: REMINDER_BASE,
    });

    expect(result[0].shows[0]).toMatchObject({
      id: "show-1",
      title: "Test Show",
      participants: [{ name: "DJ Test", email: ["dj@test.com"] }],
    });
  });
});
