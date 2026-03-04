import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import type { CalendarConfig } from "../config";
import { getParticipantTypes } from "../config";
import type { ShowFormValues, MutationResult, DropdownOption } from "../types";

dayjs.extend(utc);

/**
 * Minimal duck-typed interface for the Contentful management client.
 * This avoids tying the package to a specific contentful-management version
 * and works with both the chained API and any compatible mock.
 */
export interface ManagementClient {
  getSpace(spaceId: string): Promise<{
    getEnvironment(environmentId: string): Promise<{
      getEntry(id: string): Promise<ContentfulEntry>;
      createEntry(
        contentTypeId: string,
        data: { fields: Record<string, { "en-US": unknown }> }
      ): Promise<ContentfulEntry>;
    }>;
  }>;
}

interface ContentfulEntry {
  sys: { id: string; publishedVersion?: string | number | null };
  fields: Record<string, Record<string, unknown>>;
  update(): Promise<ContentfulEntry>;
  publish(): Promise<ContentfulEntry>;
  archive(): Promise<ContentfulEntry>;
}

/** Converts an array of dropdown options to Contentful reference links */
function createReferencesArray(
  options: DropdownOption[]
): Array<{ sys: { type: "Link"; linkType: "Entry"; id: string } }> {
  return options.map((opt) => ({
    sys: { type: "Link" as const, linkType: "Entry" as const, id: opt.value },
  }));
}

/** Formats artist names for the internal/admin note field */
function formatArtistsLabel(
  artists: DropdownOption[],
  hasExtraArtists?: boolean,
  extraArtists?: Array<{ name: string }>
): string {
  const all = [...artists];
  if (all.length === 0) return "";
  if (all.length === 1) return all[0].label ?? "";
  const names = all.map((a) => a.label);
  return [names.slice(0, -1).join(", "), names.slice(-1)[0]].join(" & ");
}

async function getEnvironment(
  client: ManagementClient,
  config: CalendarConfig
) {
  const { spaceId, environmentId } = config.contentful;
  const space = await client.getSpace(spaceId);
  return space.getEnvironment(environmentId || "master");
}

export async function createCalendarShow(
  values: ShowFormValues,
  client: ManagementClient,
  config: CalendarConfig
): Promise<MutationResult> {
  const f = config.fields.show;
  const af = config.fields.artist;
  const environment = await getEnvironment(client, config);

  const startDateTime = dayjs(values.start + "Z").toISOString();
  const endDateTime = dayjs(values.end + "Z").toISOString();
  const dateFormatted = dayjs(values.start).format("DD MMM YYYY");

  const artistsLabel = formatArtistsLabel(
    values.artists,
    values.hasExtraArtists,
    values.extraArtists
  );
  const internalNote = values.title
    ? values.title.split(" | ")[0] + " - "
    : "" + artistsLabel + " - " + dateFormatted;

  const fields: Record<string, { "en-US": unknown }> = {
    [f.title]: { "en-US": values.title ?? "" },
    [f.date]: { "en-US": startDateTime },
    [f.dateEnd]: { "en-US": endDateTime },
    [f.status]: { "en-US": values.status.value },
    [f.type]: { "en-US": values.type ?? config.typeValues.live },
  };

  // Write each participant type to its own reference field
  for (const pt of getParticipantTypes(config)) {
    const selected =
      values.participants?.[pt.showField] ??
      (pt.showField === f.artists ? values.artists : []);
    fields[pt.showField] = { "en-US": createReferencesArray(selected) };
  }

  if (f.internal) {
    fields[f.internal] = { "en-US": internalNote };
  }
  if (f.isFeatured && values.isFeatured != null) {
    fields[f.isFeatured] = { "en-US": values.isFeatured };
  }

  const entry = await environment.createEntry(config.contentTypes.show, {
    fields,
  });
  console.log(`Show ${entry.sys.id} created.`);

  return {
    entry,
    confirmationEmail: values.status.value === config.statusValues.confirmed,
  };
}

export async function updateCalendarShow(
  values: Partial<ShowFormValues> & { id: string },
  client: ManagementClient,
  config: CalendarConfig
): Promise<MutationResult> {
  const f = config.fields.show;
  const environment = await getEnvironment(client, config);

  const startDateTime = dayjs(values.start + "Z").toISOString();
  const endDateTime = dayjs(values.end + "Z").toISOString();
  let confirmationEmail = false;

  const entry = await environment.getEntry(values.id);

  // Check if status is moving to confirmed (triggers email)
  if (
    entry.fields[f.status]?.["en-US"] === config.statusValues.tbc &&
    values.status?.value === config.statusValues.confirmed
  ) {
    confirmationEmail = true;
  }

  entry.fields[f.date]["en-US"] = startDateTime;
  entry.fields[f.dateEnd]["en-US"] = endDateTime;

  if (values.title) {
    entry.fields[f.title]["en-US"] = values.title;
  }

  // Update each participant type field
  for (const pt of getParticipantTypes(config)) {
    const selected =
      values.participants?.[pt.showField] ??
      (pt.showField === f.artists ? values.artists : undefined);
    if (selected?.length) {
      entry.fields[pt.showField] = {
        "en-US": createReferencesArray(selected),
      };
    }
  }

  // Update internal note based on primary artists (first participant type)
  const primaryArtists =
    values.participants?.[f.artists] ?? values.artists ?? [];
  if (primaryArtists.length && f.internal) {
    const artistsLabel = formatArtistsLabel(primaryArtists);
    const dateFormatted = dayjs(values.start).format("DD MMM YYYY");
    const internalNote = values.title
      ? values.title.split(" | ")[0] + " - "
      : "" + artistsLabel + " - " + dateFormatted;
    entry.fields[f.internal]["en-US"] = internalNote;
  }

  if (values.status && entry.fields[f.status]) {
    entry.fields[f.status]["en-US"] = values.status.value;
  }

  if (values.type && entry.fields[f.type]) {
    entry.fields[f.type]["en-US"] = values.type;
  }

  if (f.isFeatured && values.isFeatured != null) {
    entry.fields[f.isFeatured] = { "en-US": values.isFeatured };
  }

  const updated = await entry.update();
  console.log(`Show ${updated.sys.id} updated.`);

  // Republish if it was already published
  if (isPublished(updated)) {
    await updated.publish();
  }

  return { entry: updated, confirmationEmail };
}

export async function deleteCalendarShow(
  id: string,
  client: ManagementClient,
  config: CalendarConfig
): Promise<void> {
  const environment = await getEnvironment(client, config);
  const entry = await environment.getEntry(id);
  await entry.archive();
  console.log(`Show ${entry.sys.id} archived.`);
}

export async function createArtist(
  artist: { name: string; pronouns?: string; email?: string },
  client: ManagementClient,
  config: CalendarConfig
): Promise<DropdownOption> {
  const af = config.fields.artist;
  const environment = await getEnvironment(client, config);

  const fields: Record<string, { "en-US": unknown }> = {
    [af.name]: { "en-US": artist.name },
  };

  if (af.internal) {
    fields[af.internal] = { "en-US": artist.name };
  }
  if (af.pronouns && artist.pronouns) {
    fields[af.pronouns] = { "en-US": artist.pronouns };
  }
  if (af.isResident) {
    fields[af.isResident] = { "en-US": false };
  }
  if (artist.email) {
    fields[af.email] = { "en-US": [artist.email] };
  }

  const entry = await environment.createEntry(config.contentTypes.artist, {
    fields,
  });
  console.log(`Artist ${entry.sys.id} created.`);

  return { value: entry.sys.id, label: artist.name };
}

export async function updateArtistEmail(
  id: string,
  /** Comma-separated email string, e.g. "a@b.com, c@d.com" */
  email: string,
  client: ManagementClient,
  config: CalendarConfig
): Promise<void> {
  const af = config.fields.artist;
  const environment = await getEnvironment(client, config);
  const entry = await environment.getEntry(id);
  const emailArray = email
    .split(", ")
    .map((e) => e.trim())
    .filter(Boolean);
  entry.fields[af.email] = { "en-US": emailArray };
  const updated = await entry.update();
  if (isPublished(updated)) {
    await updated.publish();
  }
}

function isPublished(entry: {
  sys: { publishedVersion?: string | number | null };
}): boolean {
  return Boolean(entry.sys.publishedVersion);
}
