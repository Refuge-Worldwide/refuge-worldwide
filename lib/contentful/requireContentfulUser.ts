import type { NextApiRequest, NextApiResponse } from "next";

// A token is only accepted if Contentful confirms it can access our space,
// so a valid token for some other Contentful space is still rejected.
export async function requireContentfulUser(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<boolean> {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;

  if (token && spaceId) {
    try {
      const check = await fetch(
        `https://api.contentful.com/spaces/${spaceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (check.ok) return true;
    } catch {
      // not a 401, so the browser doesn't throw away a still-valid token
      res.status(503).json({ error: "Could not reach Contentful" });
      return false;
    }
  }

  res.status(401).json({ error: "Unauthorized" });
  return false;
}
