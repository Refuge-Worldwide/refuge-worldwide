import type { NextApiRequest, NextApiResponse } from "next";
import createClient from "@/lib/supabase/api";
import { graphql } from "@/lib/contentful";
import { placeholderImage } from "@/util";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createClient(req, res);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Get liked show IDs from Supabase
    const { data: likes, error: likesError } = await supabase
      .from("showLikes")
      .select("show_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (likesError) {
      throw new Error(likesError.message);
    }

    if (!likes || likes.length === 0) {
      return res.status(200).json({ shows: [] });
    }

    const showIds = likes.map((l) => l.show_id);

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

    // Preserve the order from likes (most recently liked first)
    const orderedShows = showIds
      .map((id) => shows.find((s: any) => s.sys.id === id))
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
