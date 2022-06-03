import * as Contentful from "contentful";
import { TypePageBookingFields } from "../../types/contentful";

enum CONTENTFUL_PAGE_IDS {
  BOOKING_PAGE = "5ApzlspIzqeUmURGvpTCug",
  NEWSLETTER_PAGE = "7t2jOQoBCZ6sGK4HgBZZ42",
}

export const client = Contentful.createClient({
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN,
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
});

export const previewClient = Contentful.createClient({
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN,
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
  host: "preview.contentful.com",
});

export const getClient = (preview?: boolean) =>
  preview ? previewClient : client;

export const getBookingsPage = async (preview?: boolean) => {
  const { fields } = await getClient(preview).getEntry<TypePageBookingFields>(
    CONTENTFUL_PAGE_IDS.BOOKING_PAGE
  );

  return fields;
};

export async function getAllEntries<Fields>(
  contentType: "genre" | "show" | "article" | "artist",
  perPage: number,
  options: Contentful.EntriesQueries<Fields> = {}
) {
  console.log(`[Contentful] Running getEntries for ${contentType}`);

  const { total } = await client.getEntries<Fields>({
    content_type: contentType,
    limit: 1,
  });

  console.log(`[Contentful] [${contentType}] Entries: ${total}`);

  const entries = await Promise.all(
    [...Array(Math.round(total / perPage + 1))].map(async (_, index) => {
      const { items } = await client.getEntries<Fields>({
        ...options,
        content_type: contentType,
        limit: perPage,
        skip: index * perPage,
      });

      return items;
    })
  );

  return entries.flat() as Contentful.Entry<Fields>[];
}
