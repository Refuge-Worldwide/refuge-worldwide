import { GRAPHCDN_ENDPOINT } from "../../constants";
import type { ErrorPayload } from "../../types/shared";

export const LIMITS = {
  SHOWS: 550,
  ARTISTS: 2000,
  ARTICLES: 100,
};

function getErrorMessage(payload: ErrorPayload) {
  return payload.errors[0].message;
}

interface GraphQLInterface {
  variables?: Record<string, string | boolean | number>;
  preview?: boolean;
}

export async function graphql(
  query: string,
  { preview, variables }: GraphQLInterface = { preview: false, variables: {} }
) {
  const r = await fetch(GRAPHCDN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${
        preview
          ? process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN
          : process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN
      }`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (r.ok) {
    return r.json();
  }

  throw new Error(getErrorMessage(await r.json()));
}
