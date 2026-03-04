/**
 * Generic types that the package uses internally and exposes to consumers.
 * These are independent of any station's specific Contentful field names —
 * the mapper layer translates between Contentful entries and these types.
 */

export interface CalendarArtist {
  id: string;
  name: string;
  email: string[];
}

/** A show as returned by the calendar read API — ready for FullCalendar */
export interface CalendarShow {
  id: string;
  title: string;
  /** ISO datetime without timezone suffix (for FullCalendar) */
  start: string | null;
  /** ISO datetime without timezone suffix (for FullCalendar) */
  end: string | null;
  type: string;
  status: string;
  /** Whether the show has been published in Contentful */
  published: boolean;
  isFeatured: boolean;
  artists: DropdownOption[];
  mixcloudLink?: string;
  booker?: string;
  images: string[];
  backgroundColor: string;
  borderColor: string;
}

/** A raw show entry as fetched from Contentful, before processing */
export interface RawCalendarShow {
  sys: {
    id: string;
    publishedVersion?: string | null;
  };
  title: string;
  type?: string;
  date: string;
  dateEnd: string;
  slug?: string;
  status?: string;
  mixcloudLink?: string;
  booker?: string;
  isFeatured?: boolean;
  artists: {
    items: Array<{
      sys: { id: string };
      name: string;
      email?: string[];
    }>;
  };
  coverImage?: { url: string };
  additionalImages?: string[];
  additionalMediaImages?: { items: Array<{ url: string }> };
}

export interface DropdownOption {
  value: string;
  label: string;
  email?: string[];
  /**
   * Which show reference field this option belongs to (e.g. 'artists', 'labels').
   * Used when multiple participant types are configured to split the flat display
   * list back into per-type arrays when pre-populating the edit form.
   */
  sourceField?: string;
}

/** Values the show create/update form submits */
export interface ShowFormValues {
  id?: string;
  title?: string;
  type?: string;
  start: string;
  end: string;
  status: DropdownOption;
  /** Legacy single-type artists field — used when `config.participants` is not set */
  artists: DropdownOption[];
  /**
   * Multi-type participant selections, keyed by the participant's `showField`.
   * e.g. `{ artists: [...], labels: [...] }`
   * Only populated when `config.participants` is configured.
   */
  participants?: Record<string, DropdownOption[]>;
  isFeatured?: boolean;
  hasExtraArtists?: boolean;
  extraArtists?: Array<{ name: string; pronouns?: string; email?: string }>;
}

/** Result returned from create/update operations */
export interface MutationResult {
  entry: { sys: { id: string } };
  confirmationEmail: boolean;
}
