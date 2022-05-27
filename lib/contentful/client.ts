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
