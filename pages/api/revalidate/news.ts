import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (process.env.CF_WEBHOOK_SECRET !== req.headers["webhook_secret"]) {
    return res.status(401).json({ message: "Invalid Secret" });
  }

  try {
    const slug = JSON.parse(req.body)?.fields?.slug?.["en-US"];

    if (slug) {
      await res.revalidate(`/news/${slug}`);
    }

    await res.revalidate(`/news`);

    return res.json({ revalidated: true });
  } catch (error) {
    console.error(error);

    return res.status(500).send("Error Revalidating");
  }
}
