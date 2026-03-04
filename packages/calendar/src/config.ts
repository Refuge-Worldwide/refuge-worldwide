export interface CalendarContentfulConfig {
  spaceId: string;
  environmentId: string;
  /** Delivery API token (public reads) */
  accessToken: string;
  /** Preview API token (draft reads) */
  previewToken: string;
  /**
   * Management API token — only required if NOT using Contentful OAuth auth.
   * If `auth.contentfulOAuth` is configured, leave this empty and the OAuth
   * token is used for management operations instead.
   */
  managementToken?: string;
}

/**
 * Contentful OAuth 2.0 configuration.
 *
 * Set up once per station:
 * 1. Go to app.contentful.com → your organisation → OAuth Applications
 * 2. Create an application, set the redirect URI to your calendar page URL
 * 3. Copy the Client ID here
 *
 * Users will be redirected to Contentful's login page if no valid token exists.
 * Only Contentful space members can obtain a token — natural access control.
 */
export interface ContentfulOAuthConfig {
  /** The Client ID from your Contentful OAuth application */
  clientId: string;
  /**
   * The URL Contentful redirects back to after authentication.
   * Must exactly match a redirect URI registered in your OAuth application.
   * Typically your calendar admin page URL.
   * If omitted, defaults to the current page URL at runtime (window.location.origin + pathname),
   * which works automatically across local dev, staging, and production without any env vars.
   * @example 'https://mystation.com/admin/calendar'
   */
  redirectUri?: string;
  /**
   * OAuth scopes to request. Defaults to 'content_management_manage'.
   * Only change this if you need read-only access.
   */
  scope?: string;
}

/**
 * Configuration for a single participant type (e.g. artist, label, show).
 * Each configured type gets its own labelled multi-select in the form and
 * is stored as a separate reference field on the episode entry.
 */
export interface ParticipantTypeConfig {
  /** Contentful content type ID, e.g. 'label' */
  contentTypeId: string;
  /** Form section label shown above the multi-select, e.g. 'Labels' */
  label: string;
  /** The reference field name on the show/episode entry, e.g. 'labels' */
  showField: string;
  /** Field names on this content type */
  fields: {
    /** Display name field */
    name: string;
    /** Optional email field — if absent, this type contributes no emails */
    email?: string;
  };
}

/**
 * Returns the list of participant types to use.
 * When `config.participants` is set, returns it directly.
 * Otherwise derives a single-type list from the legacy `contentTypes.artist`
 * and `fields.artist` config for full backwards compatibility.
 */
export function getParticipantTypes(
  config: CalendarConfig
): ParticipantTypeConfig[] {
  if (config.participants && config.participants.length > 0) {
    return config.participants;
  }
  return [
    {
      contentTypeId: config.contentTypes.artist,
      label: "Artists",
      showField: config.fields.show.artists,
      fields: {
        name: config.fields.artist.name,
        email: config.fields.artist.email,
      },
    },
  ];
}

/**
 * Maps the package's generic field names to the actual Contentful field names
 * used in this station's space.
 *
 * All fields are required unless marked optional. Fields you don't use can be
 * set to an empty string and will be omitted from queries.
 */
export interface ShowFieldMap {
  /** The show's display title */
  title: string;
  /** ISO datetime of show start */
  date: string;
  /** ISO datetime of show end */
  dateEnd: string;
  /** URL slug */
  slug: string;
  /** Linked artists/performers reference field */
  artists: string;
  /** Show type enum (e.g. Live / Pre-record) */
  type: string;
  /** Booking status enum (e.g. TBC / Confirmed / Submitted) */
  status: string;
  /** Whether the show is featured/highlighted */
  isFeatured: string;
  /** Cover image asset */
  coverImage: string;
  /** Recording/playback link */
  mixcloudLink?: string;
  /** Internal/admin note */
  internal?: string;
  /** Booker name */
  booker?: string;
  /** Additional media images (new collection field) */
  additionalMediaImages?: string;
}

export interface ArtistFieldMap {
  /** Display name */
  name: string;
  /** Email address(es) */
  email: string;
  /** Pronouns */
  pronouns?: string;
  /** Internal/admin note */
  internal?: string;
  /** Whether artist is a resident (boolean field) */
  isResident?: string;
}

/**
 * Maps the package's generic status keys to the actual string values stored
 * in this station's Contentful space.
 */
export interface StatusValueMap {
  tbc: string;
  confirmed: string;
  submitted: string;
}

/**
 * Maps the package's generic show type keys to actual Contentful values.
 */
export interface TypeValueMap {
  live: string;
  prerecord: string;
}

/**
 * Data passed to onShowConfirmed when a show is confirmed.
 * Use this to send confirmation emails, trigger webhooks, etc.
 */
export interface ShowNotificationData {
  id: string;
  title: string;
  /** ISO datetime string */
  date: string;
  /** ISO datetime string */
  dateEnd: string;
  participants: Array<{ name: string; email: string[] }>;
}

/**
 * Color configuration for calendar event backgrounds.
 * Keys match the generic status names (tbc, confirmed, submitted).
 */
export interface StatusColorMap {
  tbc: string;
  confirmed: string;
  submitted: string;
}

export interface CalendarConfig {
  contentful: CalendarContentfulConfig;
  /**
   * Maps generic content type keys to the actual Contentful content type IDs
   * used in this station's space.
   * @example { show: 'broadcast', artist: 'performer' }
   */
  contentTypes: {
    show: string;
    artist: string;
  };
  /**
   * Maps generic field name keys to actual Contentful field names.
   */
  fields: {
    show: ShowFieldMap;
    artist: ArtistFieldMap;
  };
  /**
   * Maps the package's generic status names to actual values in Contentful.
   * @example { tbc: 'pending', confirmed: 'confirmed', submitted: 'published' }
   */
  statusValues: StatusValueMap;
  /**
   * Maps the package's generic show type names to actual values in Contentful.
   * @example { live: 'Live', prerecord: 'Recorded' }
   */
  typeValues: TypeValueMap;
  /**
   * Calendar event background colors per status.
   * Defaults to Refuge Worldwide's colour scheme if omitted.
   */
  colors?: StatusColorMap;
  /**
   * Called when a show's status transitions to Confirmed.
   * Use this to send confirmation emails, trigger webhooks, etc.
   * The callback runs client-side — if you need server-side secrets,
   * call your own API route from inside this function.
   *
   * @example
   * ```ts
   * onShowConfirmed: async (show) => {
   *   await fetch('/api/admin/confirmation-email', {
   *     method: 'POST',
   *     headers: { 'Content-Type': 'application/json' },
   *     body: JSON.stringify(show),
   *   });
   * }
   * ```
   */
  onShowConfirmed?: (show: ShowNotificationData) => Promise<void>;
  /**
   * Multi-type participant configuration. When set, replaces the single
   * `contentTypes.artist` + `fields.artist` for all participant operations.
   *
   * Each entry gets its own labelled multi-select in the show form and is
   * stored as a separate reference field on the episode entry in Contentful.
   *
   * @example
   * ```ts
   * participants: [
   *   { contentTypeId: 'artist', label: 'Artists', showField: 'artists',
   *     fields: { name: 'name', email: 'email' } },
   *   { contentTypeId: 'label',  label: 'Labels',  showField: 'labels',
   *     fields: { name: 'labelName', email: 'contactEmail' } },
   * ]
   * ```
   */
  participants?: ParticipantTypeConfig[];
  /**
   * Authentication configuration.
   * Configure `contentfulOAuth` to enable Contentful's OAuth login flow —
   * users log in with their Contentful account and no management token is
   * needed in env vars. Recommended for multi-user setups.
   *
   * If omitted, `contentful.managementToken` must be set and will be used
   * directly (suitable for single-operator setups or CI environments).
   */
  auth?: {
    contentfulOAuth: ContentfulOAuthConfig;
  };
  /**
   * The base URL of the Next.js app (used for generating submission form links).
   * Defaults to NEXT_PUBLIC_SITE_URL env var.
   */
  siteUrl?: string;
  /**
   * Path to the artist submission form (relative to siteUrl).
   * If set, a "copy link" button appears on each show.
   * @example 'submission-v2'  →  https://yoursite.com/submission-v2?id=<showId>
   */
  submissionFormPath?: string;
  /**
   * Contentful space URL for direct entry links in the admin UI.
   * Defaults to `https://app.contentful.com/spaces/{spaceId}`.
   */
  contentfulAppUrl?: string;
}

/**
 * Define your calendar configuration with full TypeScript type safety.
 *
 * @example
 * ```ts
 * import { defineCalendarConfig } from '@refuge-worldwide/contentful-calendar';
 *
 * export default defineCalendarConfig({
 *   contentful: {
 *     spaceId: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!,
 *     environmentId: process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT_ID!,
 *     accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN!,
 *     previewToken: process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN!,
 *     managementToken: process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN!,
 *   },
 *   contentTypes: { show: 'show', artist: 'artist' },
 *   fields: {
 *     show: {
 *       title: 'title', date: 'date', dateEnd: 'dateEnd',
 *       slug: 'slug', artists: 'artists', type: 'type',
 *       status: 'status', isFeatured: 'isFeatured', coverImage: 'coverImage',
 *     },
 *     artist: { name: 'name', email: 'email' },
 *   },
 *   statusValues: { tbc: 'TBC', confirmed: 'Confirmed', submitted: 'Submitted' },
 *   typeValues: { live: 'Live', prerecord: 'Pre-record' },
 * });
 * ```
 */
export function defineCalendarConfig(config: CalendarConfig): CalendarConfig {
  return config;
}

/** Default Refuge Worldwide config — used when the Refuge app consumes its own package */
export const refugeDefaultConfig = {
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
      mixcloudLink: "mixcloudLink",
      internal: "internal",
      booker: "booker",
      additionalMediaImages: "additionalMediaImages",
    },
    artist: {
      name: "name",
      email: "email",
      pronouns: "pronouns",
      internal: "internal",
      isResident: "role",
    },
  },
  statusValues: { tbc: "TBC", confirmed: "Confirmed", submitted: "Submitted" },
  typeValues: { live: "Live", prerecord: "Pre-record" },
  colors: {
    tbc: "#e3e3e3",
    confirmed: "#F1E2AF",
    submitted: "#B3DCC1",
  },
  submissionFormPath: "submission-v2",
} as const satisfies Omit<CalendarConfig, "contentful">;
