import type { NextApiRequest, NextApiResponse } from "next";
import { getSessionUser } from "@/lib/directus/session";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await getSessionUser(req, res);
  return res.status(200).json({ user });
}
