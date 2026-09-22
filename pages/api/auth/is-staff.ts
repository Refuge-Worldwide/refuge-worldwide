import type { NextApiRequest, NextApiResponse } from "next";
import { getSessionUser } from "@/lib/directus/session";
import { getUserAccess, getUserIdFromToken } from "@/lib/directus/staff";

// app can't read Directus roles itself, so it asks this instead
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const bearer = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  let userId: string | null = null;
  if (bearer) {
    userId = await getUserIdFromToken(bearer);
  } else {
    userId = (await getSessionUser(req, res, "id"))?.id ?? null;
  }

  if (!userId) {
    return res.status(200).json({ isStaff: false, hasSupporterAccess: false });
  }

  const { isStaff, hasSupporterAccess } = await getUserAccess(userId);
  return res.status(200).json({ isStaff, hasSupporterAccess });
}
