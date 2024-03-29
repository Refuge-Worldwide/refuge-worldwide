import type { NextApiRequest, NextApiResponse } from "next";
import { getWorkshopPageSingle } from "../../../lib/contentful/pages/workshops";

export default async function preview(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { secret, slug } = req.query;

  if (secret !== process.env.CONTENTFUL_PREVIEW_SECRET || !slug) {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    const { workshop } = await getWorkshopPageSingle(slug as string, true);

    res.setPreviewData({});

    res.writeHead(307, { Location: `/workshops/${workshop.slug}` });
    res.end();
  } catch (error) {
    console.error(error);

    return res.status(401).json({ message: "Invalid slug" });
  }
}
