import type { NextApiRequest, NextApiResponse } from "next";
import { getSessionUser } from "@/lib/directus/session";
import { getUserAccess } from "@/lib/directus/staff";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await getSessionUser(req, res);
  if (!user) return res.status(200).json({ user: null, isStaff: false });

  let isStaff = false;
  try {
    isStaff = (await getUserAccess(user.id)).isStaff;
  } catch {
    // a failed role lookup shouldn't sign anyone out
  }

  return res.status(200).json({ user, isStaff });
}
