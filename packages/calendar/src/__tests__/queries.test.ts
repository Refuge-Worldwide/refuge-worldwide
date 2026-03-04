import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  buildCalendarQuery,
  buildSearchQuery,
  buildArtistSearchQuery,
  executeGraphQL,
  extractItems,
  processShow,
} from "../lib/queries";
import {
  testConfig,
  fullFieldConfig,
  makeRawShow,
  SHOW_DATE,
  SHOW_DATE_END,
  FC_START,
  FC_END,
} from "./helpers";

// ── buildCalendarQuery ────────────────────────────────────────────────────────

describe("buildCalendarQuery", () => {
  it("uses config field names as GraphQL aliases", () => {
    const q = buildCalendarQuery(testConfig);
    expect(q).toContain("title: title");
    expect(q).toContain("date: date");
    expect(q).toContain("dateEnd: dateEnd");
    expect(q).toContain("status: status");
    expect(q).toContain("type: type");
  });

  it("uses the configured content type for the collection name", () => {
    const q = buildCalendarQuery(testConfig);
    expect(q).toContain("showCollection(");
  });

  it("uses a custom content type ID when configured", () => {
    const config = {
      ...testConfig,
      contentTypes: { show: "broadcast", artist: "performer" },
    };
    const q = buildCalendarQuery(config);
    expect(q).toContain("broadcastCollection(");
  });

  it("uses the artists field as a collection alias", () => {
    const q = buildCalendarQuery(testConfig);
    expect(q).toContain("artists: artistsCollection");
  });

  it("omits mixcloudLink when not configured", () => {
    const q = buildCalendarQuery(testConfig);
    expect(q).not.toContain("mixcloudLink");
  });

  it("includes mixcloudLink when configured", () => {
    const q = buildCalendarQuery(fullFieldConfig);
    expect(q).toContain("mixcloudLink");
  });

  it("omits additionalMediaImages when not configured", () => {
    const q = buildCalendarQuery(testConfig);
    expect(q).not.toContain("additionalMediaImages");
  });

  it("includes additionalMediaImages when configured", () => {
    const q = buildCalendarQuery(fullFieldConfig);
    expect(q).toContain("additionalMediaImages");
  });

  it("uses custom artist field names in the artists sub-query", () => {
    const q = buildCalendarQuery(testConfig);
    expect(q).toContain("name: name");
    expect(q).toContain("email: email");
  });
});

// ── buildSearchQuery ──────────────────────────────────────────────────────────

describe("buildSearchQuery", () => {
  it("orders by date DESC", () => {
    const q = buildSearchQuery(testConfig);
    expect(q).toContain("date_DESC");
  });

  it("uses title_contains filter", () => {
    const q = buildSearchQuery(testConfig);
    expect(q).toContain("title_contains");
  });
});

// ── buildArtistSearchQuery ────────────────────────────────────────────────────

describe("buildArtistSearchQuery", () => {
  it("queries the artist content type collection", () => {
    const q = buildArtistSearchQuery(testConfig);
    expect(q).toContain("artistCollection(");
  });

  it("uses name_contains filter", () => {
    const q = buildArtistSearchQuery(testConfig);
    expect(q).toContain("name_contains");
  });

  it("orders by name ASC", () => {
    const q = buildArtistSearchQuery(testConfig);
    expect(q).toContain("name_ASC");
  });
});

// ── extractItems ──────────────────────────────────────────────────────────────

describe("extractItems", () => {
  it("extracts items from the correct collection key", () => {
    const data = { showCollection: { items: [{ id: "1" }, { id: "2" }] } };
    expect(extractItems(data, "show")).toEqual([{ id: "1" }, { id: "2" }]);
  });

  it("returns empty array when collection key is missing", () => {
    expect(extractItems({}, "show")).toEqual([]);
  });

  it("returns empty array when items is missing", () => {
    expect(extractItems({ showCollection: {} }, "show")).toEqual([]);
  });
});

// ── processShow ───────────────────────────────────────────────────────────────

describe("processShow", () => {
  it("maps TBC status to the tbc color", () => {
    const show = makeRawShow({ status: "TBC" });
    const result = processShow(show, testConfig);
    expect(result.backgroundColor).toBe("#e3e3e3");
    expect(result.borderColor).toBe("#e3e3e3");
  });

  it("maps Confirmed status to the confirmed color", () => {
    const show = makeRawShow({ status: "Confirmed" });
    const result = processShow(show, testConfig);
    expect(result.backgroundColor).toBe("#F1E2AF");
  });

  it("falls back to submitted color for unknown status", () => {
    const show = makeRawShow({ status: "SomethingElse" });
    const result = processShow(show, testConfig);
    expect(result.backgroundColor).toBe("#B3DCC1");
  });

  it("uses submitted color when status is undefined", () => {
    const show = makeRawShow({ status: undefined });
    const result = processShow(show, testConfig);
    expect(result.backgroundColor).toBe("#B3DCC1");
  });

  it("strips the trailing Z timezone suffix from datetimes", () => {
    const show = makeRawShow({ date: SHOW_DATE, dateEnd: SHOW_DATE_END });
    const result = processShow(show, testConfig);
    expect(result.start).toBe(FC_START);
    expect(result.end).toBe(FC_END);
  });

  it("returns null start/end when dates are missing", () => {
    const show = makeRawShow({
      date: undefined as unknown as string,
      dateEnd: undefined as unknown as string,
    });
    const result = processShow(show, testConfig);
    expect(result.start).toBeNull();
    expect(result.end).toBeNull();
  });

  it("maps artists to DropdownOption array", () => {
    const show = makeRawShow({
      artists: {
        items: [
          { sys: { id: "a1" }, name: "DJ One", email: ["one@test.com"] },
          { sys: { id: "a2" }, name: "DJ Two", email: [] },
        ],
      },
    });
    const result = processShow(show, testConfig);
    expect(result.artists).toEqual([
      {
        value: "a1",
        label: "DJ One",
        email: ["one@test.com"],
        sourceField: "artists",
      },
      { value: "a2", label: "DJ Two", email: [], sourceField: "artists" },
    ]);
  });

  it("marks show as published when publishedVersion is set", () => {
    const show = makeRawShow({ sys: { id: "s1", publishedVersion: 5 } });
    expect(processShow(show, testConfig).published).toBe(true);
  });

  it("marks show as unpublished when publishedVersion is null", () => {
    const show = makeRawShow({ sys: { id: "s1", publishedVersion: null } });
    expect(processShow(show, testConfig).published).toBe(false);
  });

  it("collects cover image URL", () => {
    const show = makeRawShow({
      coverImage: { url: "https://img.test/cover.jpg" },
    });
    const result = processShow(show, testConfig);
    expect(result.images).toContain("https://img.test/cover.jpg");
  });

  it("collects additional media images", () => {
    const show = makeRawShow({
      additionalMediaImages: {
        items: [
          { url: "https://img.test/a.jpg" },
          { url: "https://img.test/b.jpg" },
        ],
      },
    });
    const result = processShow(show, testConfig);
    expect(result.images).toContain("https://img.test/a.jpg");
    expect(result.images).toContain("https://img.test/b.jpg");
  });

  it("combines cover image with additional images", () => {
    const show = makeRawShow({
      coverImage: { url: "https://img.test/cover.jpg" },
      additionalMediaImages: { items: [{ url: "https://img.test/extra.jpg" }] },
    });
    const result = processShow(show, testConfig);
    expect(result.images).toEqual([
      "https://img.test/cover.jpg",
      "https://img.test/extra.jpg",
    ]);
  });

  it("uses custom colors from config", () => {
    const config = {
      ...testConfig,
      colors: { tbc: "#aaa", confirmed: "#bbb", submitted: "#ccc" },
    };
    expect(
      processShow(makeRawShow({ status: "TBC" }), config).backgroundColor
    ).toBe("#aaa");
    expect(
      processShow(makeRawShow({ status: "Confirmed" }), config).backgroundColor
    ).toBe("#bbb");
    expect(
      processShow(makeRawShow({ status: "Submitted" }), config).backgroundColor
    ).toBe("#ccc");
  });

  it("defaults isFeatured to false when missing", () => {
    const show = makeRawShow({ isFeatured: undefined });
    expect(processShow(show, testConfig).isFeatured).toBe(false);
  });
});

// ── executeGraphQL ────────────────────────────────────────────────────────────

describe("executeGraphQL", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends POST to the Contentful GraphQL endpoint", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: {} }),
    } as Response);

    await executeGraphQL("query {}", testConfig);

    const [url, opts] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toContain("graphql.contentful.com");
    expect((opts as RequestInit).method).toBe("POST");
  });

  it("uses the delivery token by default", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: {} }),
    } as Response);

    await executeGraphQL("query {}", testConfig);

    const [, opts] = vi.mocked(fetch).mock.calls[0];
    const headers = (opts as RequestInit).headers as Record<string, string>;
    expect(headers["Authorization"]).toContain("test-access-token");
  });

  it("uses the preview token when preview=true", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: {} }),
    } as Response);

    await executeGraphQL("query {}", testConfig, { preview: true });

    const [, opts] = vi.mocked(fetch).mock.calls[0];
    const headers = (opts as RequestInit).headers as Record<string, string>;
    expect(headers["Authorization"]).toContain("test-preview-token");
  });

  it("throws on non-ok HTTP response", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    } as Response);

    await expect(executeGraphQL("query {}", testConfig)).rejects.toThrow(
      "Contentful GraphQL error: 401"
    );
  });

  it("throws when response contains GraphQL errors", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        errors: [{ message: "Field not found" }],
      }),
    } as Response);

    await expect(executeGraphQL("query {}", testConfig)).rejects.toThrow(
      "Contentful GraphQL query failed"
    );
  });

  it("returns data from successful response", async () => {
    const mockData = { showCollection: { items: [] } };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockData }),
    } as Response);

    const result = await executeGraphQL("query {}", testConfig);
    expect(result).toEqual(mockData);
  });
});
