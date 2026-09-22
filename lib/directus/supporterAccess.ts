import type { NextApiRequest, NextApiResponse } from "next";
import { getValidAccessToken } from "@/lib/directus/session";
import { getUserAccess, getUserIdFromToken } from "@/lib/directus/staff";

// 401 = not signed in, 403 = signed in but not a supporter/staff
export async function requireSupporterToken(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<string | null> {
  const token = await getValidAccessToken(req, res);
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  const userId = await getUserIdFromToken(token);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  const access = await getUserAccess(userId);
  if (!access.hasSupporterAccess) {
    res.status(403).json({ error: "This is a perk for supporters" });
    return null;
  }

  return token;
}
