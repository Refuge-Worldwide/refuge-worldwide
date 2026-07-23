import type { NextApiRequest, NextApiResponse } from "next";
import { directusUrl, getValidAccessToken } from "@/lib/directus/session";
import { graphql } from "@/lib/contentful";
import { placeholderImage } from "@/util";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = await getValidAccessToken(req, res);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Get liked show IDs from Directus (show_favourites is scoped to the
    // caller's own rows by the "Refuge App - Own Favourites" policy).
    const favResponse = await fetch(
      `${directusUrl}/items/show_favourites?fields=show_id&sort=-date_created&limit=-1`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!favResponse.ok) {
      throw new Error("Failed to fetch favourites");
    }
    const { data: favourites } = await favResponse.json();

    if (!favourites || favourites.length === 0) {
      return res.status(200).json({ shows: [] });
    }

    const showIds = favourites.map((f: { show_id: string }) => f.show_id);

    // Fetch show details from Contentful
    const query = /* GraphQL */ `
      query getShowsByIdsQuery($ids: [String!]!) {
        showCollection(where: { sys: { id_in: $ids } }, limit: 100) {
          items {
            sys {
              id
            }
            title
            slug
            date
            mixcloudLink
            coverImage {
              url
            }
            genresCollection(limit: 3) {
              items {
                name
              }
            }
          }
        }
      }
    `;

    const contentfulRes = await graphql(query, { variables: { ids: showIds } });
    const shows = contentfulRes.data.showCollection.items;

    // Preserve the order from favourites (most recently liked first)
    const orderedShows = showIds
      .map((id: string) => shows.find((s: any) => s.sys.id === id))
      .filter(Boolean)
      .map((show: any) => ({
        id: show.sys.id,
        title: show.title,
        slug: show.slug,
        date: show.date,
        mixcloudLink: show.mixcloudLink,
        coverImage: show.coverImage?.url ?? placeholderImage.url,
        genres: show.genresCollection?.items?.map((g: any) => g.name) || [],
      }));

    return res.status(200).json({ shows: orderedShows });
  } catch (error) {
    console.error("Error fetching liked shows:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to fetch likes",
    });
  }
}
