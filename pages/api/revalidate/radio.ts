import { NextApiRequest, NextApiResponse } from "next";
import { client } from "../../../lib/contentful/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (process.env.CF_WEBHOOK_SECRET !== req.headers["webhook_secret"]) {
    return res.status(401).json({ message: "Invalid Secret" });
  }

  try {
    console.log("Revalidating radio page...");
    console.log("Request body:", req.body);
    const id = JSON.parse(req.body)?.sys?.id;
    const slug = JSON.parse(req.body)?.fields?.slug?.["en-US"];
    const artists = JSON.parse(req.body)?.fields?.artists?.["en-US"];

    if (slug) {
      await res.revalidate(`/radio/${slug}`);
    }

    await res.revalidate(`/radio`);

    for (const artist of artists) {
      console.log("Revalidating artist page...");
      console.log("Artist ID:", artist.sys.id);
      const artistEnriched = await client.getEntry(artist.sys.id);
      console.log("Artist Enriched:", artistEnriched);
      const artistSlug = artistEnriched?.fields?.slug;
      console.log("Artist Slug:", artistSlug);
      if (artistSlug) {
        await res.revalidate(`/artists/${artistSlug}`);
      }
    }

    return res.json({ revalidated: true });
  } catch (error) {
    console.error(error);

    return res.status(500).send("Error Revalidating");
  }
}
