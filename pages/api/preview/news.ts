import type { NextApiRequest, NextApiResponse } from "next";
import { getNewsPageSingle } from "../../../lib/contentful/pages/news";

export default async function preview(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { secret, slug } = req.query;

  if (secret !== process.env.CONTENTFUL_PREVIEW_SECRET || !slug) {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    const { article } = await getNewsPageSingle(slug as string, true);

    res.setPreviewData({});

    res.writeHead(307, { Location: `/news/${article.slug}` });
    res.end();
  } catch (error) {
    console.error(error);

    return res.status(401).json({ message: "Invalid slug" });
  }
}
