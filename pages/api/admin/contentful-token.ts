import type { NextApiRequest, NextApiResponse } from "next";
import { requireStaffApi } from "@/lib/directus/staff";
import { getAccessTokenRow } from "@/lib/accessTokens";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!(await requireStaffApi(req, res))) return;

  const row = await getAccessTokenRow("contentful");
  if (!row?.token) {
    return res.status(404).json({ error: "No Contentful token configured" });
  }

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ token: row.token });
}
