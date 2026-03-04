import type { CalendarConfig } from "../config";
import type { RawCalendarShow } from "../types";

// ── Shared date constants (always 2 years ahead) ──────────────────────────────
const Y = new Date().getFullYear() + 2;

/** ISO strings for show start/end used in raw show objects */
export const SHOW_DATE = `${Y}-06-15T20:00:00.000Z`;
export const SHOW_DATE_END = `${Y}-06-15T22:00:00.000Z`;

/** Form value strings (no timezone suffix, as entered in the datetime-local input) */
export const FORM_START = `${Y}-06-15T20:00`;
export const FORM_END = `${Y}-06-15T22:00`;

/** Expected FullCalendar strings after processShow strips the trailing Z */
export const FC_START = `${Y}-06-15T20:00:00.000`;
export const FC_END = `${Y}-06-15T22:00:00.000`;

/** ISO dates used for Contentful entry fields in mutation tests */
export const ENTRY_DATE = `${Y}-01-01T10:00:00.000Z`;
export const ENTRY_DATE_END = `${Y}-01-01T12:00:00.000Z`;

/** Base date for reminder/cron tests — a Monday 7 days before the show */
export const REMINDER_BASE = new Date(`${Y}-06-08T09:00:00Z`);
/** The show date that falls exactly 7 days after REMINDER_BASE */
export const REMINDER_SHOW_DATE = `${Y}-06-15T20:00:00.000Z`;

/** Date range strings for calendar API handler tests */
export const CAL_START = `${Y}-06-01`;
export const CAL_END = `${Y}-06-30`;

/** Minimal valid config for tests */
export const testConfig: CalendarConfig = {
  contentful: {
    spaceId: "test-space",
    environmentId: "master",
    accessToken: "test-access-token",
    previewToken: "test-preview-token",
  },
  contentTypes: { show: "show", artist: "artist" },
  fields: {
    show: {
      title: "title",
      date: "date",
      dateEnd: "dateEnd",
      slug: "slug",
      artists: "artists",
      type: "type",
      status: "status",
      isFeatured: "isFeatured",
      coverImage: "coverImage",
    },
    artist: { name: "name", email: "email" },
  },
  statusValues: { tbc: "TBC", confirmed: "Confirmed", submitted: "Submitted" },
  typeValues: { live: "Live", prerecord: "Pre-record" },
  colors: { tbc: "#e3e3e3", confirmed: "#F1E2AF", submitted: "#B3DCC1" },
};

/** Config with all optional show fields enabled */
export const fullFieldConfig: CalendarConfig = {
  ...testConfig,
  fields: {
    ...testConfig.fields,
    show: {
      ...testConfig.fields.show,
      mixcloudLink: "mixcloudLink",
      internal: "internal",
      booker: "booker",
      additionalMediaImages: "additionalMediaImages",
    },
    artist: {
      ...testConfig.fields.artist,
      pronouns: "pronouns",
      internal: "internalNote",
      isResident: "role",
    },
  },
};

export function makeRawShow(
  overrides: Partial<RawCalendarShow> = {}
): RawCalendarShow {
  return {
    sys: { id: "show-1", publishedVersion: null },
    title: "Test Show",
    type: "Live",
    date: SHOW_DATE,
    dateEnd: SHOW_DATE_END,
    status: "Confirmed",
    isFeatured: false,
    artists: {
      items: [
        { sys: { id: "artist-1" }, name: "DJ Test", email: ["dj@test.com"] },
      ],
    },
    ...overrides,
  };
}

export function makeEntry(
  id: string,
  fields: Record<string, unknown> = {},
  publishedVersion: number | null = null
) {
  const entry = {
    sys: { id, publishedVersion },
    fields: Object.fromEntries(
      Object.entries(fields).map(([k, v]) => [k, { "en-US": v }])
    ),
    update: vi.fn().mockResolvedValue(undefined as unknown),
    publish: vi.fn().mockResolvedValue(undefined as unknown),
    archive: vi.fn().mockResolvedValue(undefined as unknown),
  };
  // update/publish/archive return the entry itself
  entry.update.mockResolvedValue(entry);
  entry.publish.mockResolvedValue(entry);
  entry.archive.mockResolvedValue(entry);
  return entry;
}

export function makeClient(entry?: ReturnType<typeof makeEntry>) {
  const env = {
    getEntry: vi.fn().mockResolvedValue(entry),
    createEntry: vi.fn().mockResolvedValue(entry),
  };
  const space = { getEnvironment: vi.fn().mockResolvedValue(env) };
  const client = { getSpace: vi.fn().mockResolvedValue(space) };
  return { client, space, env };
}
