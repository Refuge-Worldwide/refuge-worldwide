import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createCalendarShow,
  updateCalendarShow,
  deleteCalendarShow,
  createArtist,
  updateArtistEmail,
} from "../lib/mutations";
import {
  testConfig,
  fullFieldConfig,
  makeEntry,
  makeClient,
  FORM_START,
  FORM_END,
  ENTRY_DATE,
  ENTRY_DATE_END,
} from "./helpers";
import type { ShowFormValues } from "../types";

const baseFormValues: ShowFormValues = {
  start: FORM_START,
  end: FORM_END,
  status: { value: "TBC", label: "TBC" },
  artists: [{ value: "artist-1", label: "DJ Test", email: ["dj@test.com"] }],
};

describe("createCalendarShow", () => {
  it("creates an entry with correctly mapped fields", async () => {
    const entry = makeEntry("new-show");
    const { client, env } = makeClient(entry);

    await createCalendarShow(baseFormValues, client, testConfig);

    expect(env.createEntry).toHaveBeenCalledWith(
      "show",
      expect.objectContaining({
        fields: expect.objectContaining({
          title: { "en-US": "" },
          status: { "en-US": "TBC" },
          type: { "en-US": "Live" },
        }),
      })
    );
  });

  it("converts local datetime to UTC ISO", async () => {
    const entry = makeEntry("new-show");
    const { client, env } = makeClient(entry);

    await createCalendarShow(baseFormValues, client, testConfig);

    const fields = env.createEntry.mock.calls[0][1].fields;
    // start + "Z" should parse to a valid ISO string
    expect(fields.date["en-US"]).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(fields.dateEnd["en-US"]).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("creates artist reference links", async () => {
    const entry = makeEntry("new-show");
    const { client, env } = makeClient(entry);

    await createCalendarShow(baseFormValues, client, testConfig);

    const fields = env.createEntry.mock.calls[0][1].fields;
    expect(fields.artists["en-US"]).toEqual([
      { sys: { type: "Link", linkType: "Entry", id: "artist-1" } },
    ]);
  });

  it("returns confirmationEmail=false when status is TBC", async () => {
    const entry = makeEntry("new-show");
    const { client } = makeClient(entry);

    const result = await createCalendarShow(baseFormValues, client, testConfig);
    expect(result.confirmationEmail).toBe(false);
  });

  it("returns confirmationEmail=true when status is Confirmed", async () => {
    const entry = makeEntry("new-show");
    const { client } = makeClient(entry);
    const values = {
      ...baseFormValues,
      status: { value: "Confirmed", label: "Confirmed" },
    };

    const result = await createCalendarShow(values, client, testConfig);
    expect(result.confirmationEmail).toBe(true);
  });

  it("includes internal note when field is configured (no title → uses artists)", async () => {
    const entry = makeEntry("new-show");
    const { client, env } = makeClient(entry);
    // When title is absent the note is built from artists + date
    const values = { ...baseFormValues, title: undefined };

    await createCalendarShow(values, client, fullFieldConfig);

    const fields = env.createEntry.mock.calls[0][1].fields;
    expect(fields.internal["en-US"]).toContain("DJ Test");
  });

  it("includes internal note starting with title when title is provided", async () => {
    const entry = makeEntry("new-show");
    const { client, env } = makeClient(entry);
    const values = { ...baseFormValues, title: "My Show" };

    await createCalendarShow(values, client, fullFieldConfig);

    const fields = env.createEntry.mock.calls[0][1].fields;
    expect(fields.internal["en-US"]).toContain("My Show");
  });

  it("omits internal note when field is not configured", async () => {
    const entry = makeEntry("new-show");
    const { client, env } = makeClient(entry);

    await createCalendarShow(baseFormValues, client, testConfig);

    const fields = env.createEntry.mock.calls[0][1].fields;
    expect(fields.internal).toBeUndefined();
  });

  it("sets isFeatured when configured and provided", async () => {
    const entry = makeEntry("new-show");
    const { client, env } = makeClient(entry);
    const values = { ...baseFormValues, isFeatured: true };

    await createCalendarShow(values, client, fullFieldConfig);

    const fields = env.createEntry.mock.calls[0][1].fields;
    expect(fields.isFeatured["en-US"]).toBe(true);
  });
});

describe("updateCalendarShow", () => {
  it("updates basic show fields", async () => {
    const entry = makeEntry("show-1", {
      title: "Old Title",
      date: ENTRY_DATE,
      dateEnd: ENTRY_DATE_END,
      status: "TBC",
      type: "Live",
    });
    const { client } = makeClient(entry);
    const values = {
      ...baseFormValues,
      id: "show-1",
      title: "New Title",
    };

    await updateCalendarShow(values, client, testConfig);

    expect(entry.update).toHaveBeenCalled();
  });

  it("detects TBC → Confirmed transition and sets confirmationEmail=true", async () => {
    const entry = makeEntry("show-1", {
      status: "TBC",
      date: ENTRY_DATE,
      dateEnd: ENTRY_DATE_END,
    });
    const { client } = makeClient(entry);
    const values = {
      ...baseFormValues,
      id: "show-1",
      status: { value: "Confirmed", label: "Confirmed" },
    };

    const result = await updateCalendarShow(values, client, testConfig);
    expect(result.confirmationEmail).toBe(true);
  });

  it("does NOT set confirmationEmail when already Confirmed", async () => {
    const entry = makeEntry("show-1", {
      status: "Confirmed",
      date: ENTRY_DATE,
      dateEnd: ENTRY_DATE_END,
    });
    const { client } = makeClient(entry);
    const values = {
      ...baseFormValues,
      id: "show-1",
      status: { value: "Confirmed", label: "Confirmed" },
    };

    const result = await updateCalendarShow(values, client, testConfig);
    expect(result.confirmationEmail).toBe(false);
  });

  it("republishes the entry if it was already published", async () => {
    const entry = makeEntry(
      "show-1",
      { status: "TBC", date: ENTRY_DATE, dateEnd: ENTRY_DATE_END },
      3
    );
    const { client } = makeClient(entry);

    await updateCalendarShow(
      { ...baseFormValues, id: "show-1" },
      client,
      testConfig
    );

    expect(entry.publish).toHaveBeenCalled();
  });

  it("does NOT republish an unpublished entry", async () => {
    const entry = makeEntry(
      "show-1",
      { status: "TBC", date: ENTRY_DATE, dateEnd: ENTRY_DATE_END },
      null
    );
    const { client } = makeClient(entry);

    await updateCalendarShow(
      { ...baseFormValues, id: "show-1" },
      client,
      testConfig
    );

    expect(entry.publish).not.toHaveBeenCalled();
  });

  it("updates title when provided", async () => {
    const entry = makeEntry("show-1", {
      title: "Old",
      status: "TBC",
      date: ENTRY_DATE,
      dateEnd: ENTRY_DATE_END,
    });
    const { client } = makeClient(entry);

    await updateCalendarShow(
      { ...baseFormValues, id: "show-1", title: "New Title" },
      client,
      testConfig
    );

    expect(entry.fields["title"]["en-US"]).toBe("New Title");
  });

  it("updates artists when provided", async () => {
    const entry = makeEntry("show-1", {
      artists: [],
      status: "TBC",
      date: ENTRY_DATE,
      dateEnd: ENTRY_DATE_END,
    });
    const { client } = makeClient(entry);
    const values = {
      ...baseFormValues,
      id: "show-1",
      artists: [{ value: "artist-2", label: "DJ Two", email: [] }],
    };

    await updateCalendarShow(values, client, testConfig);

    expect(entry.fields["artists"]["en-US"]).toEqual([
      { sys: { type: "Link", linkType: "Entry", id: "artist-2" } },
    ]);
  });
});

describe("deleteCalendarShow", () => {
  it("archives the entry", async () => {
    const entry = makeEntry("show-1");
    const { client } = makeClient(entry);

    await deleteCalendarShow("show-1", client, testConfig);

    expect(entry.archive).toHaveBeenCalled();
  });
});

describe("createArtist", () => {
  it("creates entry with required fields and returns DropdownOption", async () => {
    const entry = makeEntry("artist-new");
    const { client, env } = makeClient(entry);

    const result = await createArtist(
      { name: "New Artist" },
      client,
      testConfig
    );

    expect(env.createEntry).toHaveBeenCalledWith(
      "artist",
      expect.objectContaining({
        fields: expect.objectContaining({
          name: { "en-US": "New Artist" },
        }),
      })
    );
    expect(result).toEqual({ value: "artist-new", label: "New Artist" });
  });

  it("includes pronouns when provided and configured", async () => {
    const entry = makeEntry("artist-new");
    const { client, env } = makeClient(entry);

    await createArtist(
      { name: "Artist", pronouns: "they/them" },
      client,
      fullFieldConfig
    );

    const fields = env.createEntry.mock.calls[0][1].fields;
    expect(fields.pronouns["en-US"]).toBe("they/them");
  });

  it("omits pronouns when not in config", async () => {
    const entry = makeEntry("artist-new");
    const { client, env } = makeClient(entry);

    await createArtist(
      { name: "Artist", pronouns: "they/them" },
      client,
      testConfig
    );

    const fields = env.createEntry.mock.calls[0][1].fields;
    expect(fields.pronouns).toBeUndefined();
  });

  it("stores email as array", async () => {
    const entry = makeEntry("artist-new");
    const { client, env } = makeClient(entry);

    await createArtist(
      { name: "Artist", email: "test@test.com" },
      client,
      testConfig
    );

    const fields = env.createEntry.mock.calls[0][1].fields;
    expect(fields.email["en-US"]).toEqual(["test@test.com"]);
  });
});

describe("updateArtistEmail", () => {
  it("splits comma-separated emails and trims whitespace", async () => {
    const entry = makeEntry("artist-1", { email: [] }, 1);
    const { client } = makeClient(entry);

    await updateArtistEmail(
      "artist-1",
      "a@a.com,  b@b.com",
      client,
      testConfig
    );

    expect(entry.fields["email"]["en-US"]).toEqual(["a@a.com", "b@b.com"]);
  });

  it("handles single email without comma", async () => {
    const entry = makeEntry("artist-1", { email: [] }, 1);
    const { client } = makeClient(entry);

    await updateArtistEmail("artist-1", "solo@test.com", client, testConfig);

    expect(entry.fields["email"]["en-US"]).toEqual(["solo@test.com"]);
  });

  it("republishes when entry was published", async () => {
    const entry = makeEntry("artist-1", { email: [] }, 2);
    const { client } = makeClient(entry);

    await updateArtistEmail("artist-1", "a@a.com", client, testConfig);

    expect(entry.publish).toHaveBeenCalled();
  });

  it("does NOT republish an unpublished entry", async () => {
    const entry = makeEntry("artist-1", { email: [] }, null);
    const { client } = makeClient(entry);

    await updateArtistEmail("artist-1", "a@a.com", client, testConfig);

    expect(entry.publish).not.toHaveBeenCalled();
  });
});
