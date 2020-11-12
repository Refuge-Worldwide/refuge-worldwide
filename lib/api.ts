import type { Document } from "@contentful/rich-text-types";
import type { CoverImage } from "../types/shared";
import { extractPage } from "../util";
import { ENDPOINT } from "./constants";

export async function contentful(query: string, preview = false) {
  return fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${
        preview
          ? process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN
          : process.env.CONTENTFUL_ACCESS_TOKEN
      }`,
    },
    body: JSON.stringify({ query }),
  }).then((response) => response.json());
}

export interface AboutPageData {
  coverImage: CoverImage;
  content: { json: Document };
}

export async function getAboutPage(preview: boolean): Promise<AboutPageData> {
  const data = await contentful(/* GraphQL */ `
    query {
      pageAbout(id: "z1SsoA1K4SMJryGuYjzhK", preview: ${preview}) {
        coverImage {
          title
          description
          url
          width
          height
        }
        content {
          json
        }
      }
    }
  `);

  return extractPage(data, "pageAbout");
}

export interface SupportPageData {
  coverImage: CoverImage;
  content: { json: Document };
}

export async function getSupportPage(
  preview: boolean
): Promise<SupportPageData> {
  const data = await contentful(/* GraphQL */ `
    query {
      pageSupport(id: "Aa4GRMf6fuDtkH0UhkX19", preview: ${preview}) {
        coverImage {
          title
          description
          url
          width
          height
        }
        content {
          json
        }
      }
    }
  `);

  return extractPage(data, "pageSupport");
}

export interface NewsletterPageData {
  coverImage: CoverImage;
  content: { json: Document };
}

export async function getNewsletterPage(
  preview: boolean
): Promise<NewsletterPageData> {
  const data = await contentful(/* GraphQL */ `
    query {
      pageNewsletter(id: "7t2jOQoBCZ6sGK4HgBZZ42", preview: ${preview}) {
        coverImage {
          title
          description
          url
          width
          height
        }
        content {
          json
        }
      }
    }
  `);

  return extractPage(data, "pageNewsletter");
}
