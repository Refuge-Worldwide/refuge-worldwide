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
    const id = JSON.parse(req.body)?.sys?.id;
    const slug = JSON.parse(req.body)?.fields?.slug?.["en-US"];
    const artists = JSON.parse(req.body)?.fields?.artists?.["en-US"];

    if (slug) {
      await res.revalidate(`/radio/${slug}`);
    }

    await res.revalidate(`/radio`);

    for (const artist of artists) {
      const artistEnriched = await client.getEntry(artist.sys.id);
      const artistSlug = artistEnriched?.fields?.slug;
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
