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

export interface CalendarEmailConfig {
  adapter: EmailAdapter;
  /** From address for outgoing emails */
  from: string;
  /** Optional reply-to address */
  replyTo?: string;
}

export interface EmailAdapter {
  sendConfirmation(
    to: string[],
    show: ConfirmationEmailData
  ): Promise<{ id: string }>;
  sendReminder(
    to: string[],
    show: ConfirmationEmailData,
    daysBefore: number
  ): Promise<{ id: string }>;
}

export interface ConfirmationEmailData {
  id: string;
  title: string;
  date: string;
  dateEnd: string;
  artists: Array<{ name: string; email: string[] }>;
}

export interface ReminderConfig {
  /** How many days before the show to send the reminder */
  daysBefore: number;
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
  /** Email integration. Optional — if omitted, no emails are sent. */
  email?: CalendarEmailConfig;
  /**
   * Reminder email schedule. Requires `email` to be configured.
   * @example [{ daysBefore: 7 }, { daysBefore: 1 }]
   */
  reminders?: ReminderConfig[];
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
  /**
   * API route that handles sending confirmation emails.
   * Defaults to `/api/admin/confirmation-email`.
   * Only used when a show status transitions to Confirmed.
   */
  confirmationEmailApiPath?: string;
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
