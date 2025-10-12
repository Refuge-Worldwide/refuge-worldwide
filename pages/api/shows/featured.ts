import { NextApiRequest, NextApiResponse } from "next";
import { assertError } from "ts-extras";
import { graphql } from "../../../lib/contentful";
import { PastShowSchema } from "../../../types/shared";
import { extractCollection, placeholderImage } from "../../../util";
import dayjs from "dayjs";

export type FeaturedShowsResponse = (PastShowSchema & {
  audioFile: string | null;
})[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FeaturedShowsResponse | { message: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { take = "20", skip = "0" } = req.query as {
      take?: string;
      skip?: string;
    };

    const now = dayjs().format("YYYY-MM-DD");

    const FeaturedShowsQuery = /* GraphQL */ `
      query FeaturedShowsQuery($take: Int, $skip: Int, $now: DateTime) {
        showCollection(
          order: date_DESC
          where: {
            isFeatured: true
            mixcloudLink_exists: true
            coverImage_exists: true
            date_lte: $now
          }
          limit: $take
          skip: $skip
        ) {
          items {
            sys {
              id
            }
            title
            date
            slug
            mixcloudLink
            coverImage {
              sys {
                id
              }
              title
              description
              url
              width
              height
            }
            genresCollection(limit: 9) {
              items {
                name
              }
            }
            artwork {
              sys {
                id
              }
              title
              description
              url
              width
              height
            }
          }
        }
      }
    `;

    const res_data = await graphql(FeaturedShowsQuery, {
      variables: {
        take: Number(take),
        skip: Number(skip),
        now,
      },
    });

    const shows = extractCollection(res_data, "showCollection");

    // Process shows to match PastShowSchema format
    const processedShows = shows.map((show: any) => ({
      id: show.sys.id,
      title: show.title,
      date: show.date,
      slug: show.slug,
      mixcloudLink: show.mixcloudLink,
      coverImage: show.coverImage?.url || placeholderImage.url,
      genres: show.genresCollection.items
        .map((genre: any) => genre?.name)
        .filter(Boolean),
      artwork: show.artwork?.url || null,
      audioFile: (show as any).audioFile || null,
    }));

    res
      .setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600")
      .json(processedShows);
  } catch (error) {
    assertError(error);

    console.log(error);

    res.status(500).json({ message: error.message });
  }
}
