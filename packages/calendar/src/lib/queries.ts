import type { CalendarConfig, ParticipantTypeConfig } from "../config";
import { getParticipantTypes } from "../config";
import type { RawCalendarShow, DropdownOption } from "../types";

/**
 * Contentful's GraphQL API auto-generates collection field names by appending
 * "Collection" to the reference field name.
 * e.g. field "artists" → "artistsCollection", field "performers" → "performersCollection"
 */
function collectionName(fieldName: string): string {
  return `${fieldName}Collection`;
}

/**
 * Contentful's GraphQL API derives the top-level collection query name from the
 * content type ID, capitalised.
 * e.g. content type "show" → "showCollection", "broadcast" → "broadcastCollection"
 */
function topLevelCollection(contentTypeId: string): string {
  return `${contentTypeId}Collection`;
}

/**
 * Builds the GraphQL fragment for a single participant type's collection.
 * Used in both the calendar query and the search query.
 */
function buildParticipantFragment(pt: ParticipantTypeConfig): string {
  const coll = collectionName(pt.showField);
  return `
    ${pt.showField}: ${coll}(limit: 9) {
      items {
        sys { id }
        name: ${pt.fields.name}
        ${pt.fields.email ? `email: ${pt.fields.email}` : ""}
      }
    }`;
}

/**
 * Builds the calendar shows query dynamically from the station's field config.
 *
 * We use GraphQL aliases (`genericName: actualFieldName`) so the response always
 * uses the package's generic field names, regardless of the station's schema.
 *
 * For example, if a station's "date" field is actually called "startTime":
 *   `date: startTime` in the query → response has `date` key ✓
 *
 * Filter operators also use the actual field name:
 *   `startTime_gte: $start` instead of `date_gte: $start`
 */
export function buildCalendarQuery(config: CalendarConfig): string {
  const { show: showTypeId } = config.contentTypes;
  const f = config.fields.show;

  const collection = topLevelCollection(showTypeId);
  const mediaImagesCollection = f.additionalMediaImages
    ? collectionName(f.additionalMediaImages)
    : null;

  const participantFragments = getParticipantTypes(config)
    .map(buildParticipantFragment)
    .join("\n");

  return /* GraphQL */ `
    query calendarQuery($start: DateTime, $end: DateTime, $preview: Boolean) {
      ${collection}(
        order: ${f.date}_ASC
        where: { ${f.date}_gte: $start, ${f.dateEnd}_lte: $end, ${
    f.dateEnd
  }_exists: true }
        preview: $preview
        limit: 100
      ) {
        items {
          sys { id publishedVersion }
          title: ${f.title}
          type: ${f.type}
          date: ${f.date}
          dateEnd: ${f.dateEnd}
          ${f.slug ? `slug: ${f.slug}` : ""}
          status: ${f.status}
          ${f.mixcloudLink ? `mixcloudLink: ${f.mixcloudLink}` : ""}
          ${f.isFeatured ? `isFeatured: ${f.isFeatured}` : ""}
          ${f.coverImage ? `coverImage: ${f.coverImage} { url }` : ""}
          ${
            f.additionalMediaImages && mediaImagesCollection
              ? `additionalMediaImages: ${mediaImagesCollection}(limit: 10) { items { url } }`
              : ""
          }
          ${participantFragments}
        }
      }
    }
  `;
}

export function buildSearchQuery(config: CalendarConfig): string {
  const { show: showTypeId } = config.contentTypes;
  const f = config.fields.show;

  const collection = topLevelCollection(showTypeId);
  const mediaImagesCollection = f.additionalMediaImages
    ? collectionName(f.additionalMediaImages)
    : null;

  const participantFragments = getParticipantTypes(config)
    .map(buildParticipantFragment)
    .join("\n");

  return /* GraphQL */ `
    query calendarSearchQuery($query: String, $preview: Boolean) {
      ${collection}(
        order: ${f.date}_DESC
        where: { ${f.title}_contains: $query }
        preview: $preview
        limit: 100
      ) {
        items {
          sys { id publishedVersion }
          title: ${f.title}
          type: ${f.type}
          date: ${f.date}
          dateEnd: ${f.dateEnd}
          ${f.slug ? `slug: ${f.slug}` : ""}
          ${f.booker ? `booker: ${f.booker}` : ""}
          status: ${f.status}
          ${f.mixcloudLink ? `mixcloudLink: ${f.mixcloudLink}` : ""}
          ${f.isFeatured ? `isFeatured: ${f.isFeatured}` : ""}
          ${f.coverImage ? `coverImage: ${f.coverImage} { url }` : ""}
          ${
            f.additionalMediaImages && mediaImagesCollection
              ? `additionalMediaImages: ${mediaImagesCollection}(limit: 10) { items { url } }`
              : ""
          }
          ${participantFragments}
        }
      }
    }
  `;
}

export function buildArtistSearchQuery(config: CalendarConfig): string {
  const { artist: artistTypeId } = config.contentTypes;
  const af = config.fields.artist;
  const collection = topLevelCollection(artistTypeId);

  return /* GraphQL */ `
    query artistSearchQuery($query: String, $limit: Int) {
      ${collection}(
        order: ${af.name}_ASC
        where: { ${af.name}_contains: $query }
        limit: $limit
      ) {
        items {
          sys { id }
          name: ${af.name}
          email: ${af.email}
        }
      }
    }
  `;
}

/**
 * Builds a search query for a single participant type.
 * Used by the search handler when `?type=<contentTypeId>` is requested.
 */
export function buildSingleParticipantSearchQuery(
  pt: ParticipantTypeConfig
): string {
  const collection = topLevelCollection(pt.contentTypeId);

  return /* GraphQL */ `
    query participantSearchQuery($query: String, $limit: Int) {
      ${collection}(
        order: ${pt.fields.name}_ASC
        where: { ${pt.fields.name}_contains: $query }
        limit: $limit
      ) {
        items {
          sys { id }
          name: ${pt.fields.name}
          ${pt.fields.email ? `email: ${pt.fields.email}` : ""}
        }
      }
    }
  `;
}

/**
 * Executes a GraphQL query against the Contentful Content API.
 * Uses the preview API when preview=true.
 */
export async function executeGraphQL(
  query: string,
  config: CalendarConfig,
  options: { preview?: boolean; variables?: Record<string, unknown> } = {}
): Promise<Record<string, unknown>> {
  const { preview = false, variables = {} } = options;
  const { spaceId, environmentId, accessToken, previewToken } =
    config.contentful;

  const token = preview ? previewToken : accessToken;
  const host = preview ? "preview.contentful.com" : "cdn.contentful.com";
  const env = environmentId || "master";

  const url = `https://graphql.contentful.com/content/v1/spaces/${spaceId}/environments/${env}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(
      `Contentful GraphQL error: ${res.status} ${res.statusText}`
    );
  }

  const json = (await res.json()) as {
    data?: Record<string, unknown>;
    errors?: unknown[];
  };

  if (json.errors) {
    console.error("Contentful GraphQL errors:", json.errors);
    throw new Error("Contentful GraphQL query failed");
  }

  return json.data ?? {};
}

/**
 * Extracts items from a Contentful collection response.
 * The collection key matches the content type ID + "Collection".
 */
export function extractItems<T>(
  data: Record<string, unknown>,
  contentTypeId: string
): T[] {
  const key = topLevelCollection(contentTypeId);
  const collection = data[key] as { items?: T[] } | undefined;
  return collection?.items ?? [];
}

/** Maps a raw Contentful show to a FullCalendar-ready event */
export function processShow(
  show: RawCalendarShow,
  config: CalendarConfig
): import("../types").CalendarShow {
  const colors = config.colors ?? {
    tbc: "#e3e3e3",
    confirmed: "#F1E2AF",
    submitted: "#B3DCC1",
  };

  const statusKey = getStatusKey(show.status, config);
  const bg = colors[statusKey] ?? colors.submitted;

  const images: string[] = [
    show.coverImage?.url,
    ...(show.additionalMediaImages?.items?.map((img) => img.url) ??
      show.additionalImages ??
      []),
  ].filter((url): url is string => Boolean(url));

  // Collect participants from all configured types, tagging each with sourceField
  const participantTypes = getParticipantTypes(config);
  const artists: DropdownOption[] = participantTypes.flatMap((pt) => {
    const field = (show as Record<string, unknown>)[pt.showField] as
      | {
          items: Array<{ sys: { id: string }; name: string; email?: string[] }>;
        }
      | undefined;
    return (field?.items ?? []).map((a) => ({
      value: a.sys.id,
      label: a.name,
      email: a.email ?? [],
      sourceField: pt.showField,
    }));
  });

  return {
    id: show.sys.id,
    title: show.title ?? "",
    type: show.type ?? config.typeValues.live,
    start: show.date ? show.date.slice(0, -1) : null,
    end: show.dateEnd ? show.dateEnd.slice(0, -1) : null,
    status: show.status ?? config.statusValues.submitted,
    published: Boolean(show.sys.publishedVersion),
    isFeatured: show.isFeatured ?? false,
    artists,
    mixcloudLink: show.mixcloudLink,
    booker: show.booker,
    images,
    backgroundColor: bg,
    borderColor: bg,
  };
}

function getStatusKey(
  status: string | undefined,
  config: CalendarConfig
): "tbc" | "confirmed" | "submitted" {
  if (!status) return "submitted";
  if (status === config.statusValues.tbc) return "tbc";
  if (status === config.statusValues.confirmed) return "confirmed";
  return "submitted";
}
