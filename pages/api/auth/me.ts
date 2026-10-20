import type { NextApiRequest, NextApiResponse } from "next";
import { getSessionUser } from "@/lib/directus/session";
import { getUserAccess } from "@/lib/directus/staff";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await getSessionUser(req, res);
  if (!user) {
    return res
      .status(200)
      .json({ user: null, isStaff: false, hasSupporterAccess: false });
  }

  let isStaff = false;
  let hasSupporterAccess = false;
  try {
    ({ isStaff, hasSupporterAccess } = await getUserAccess(user.id));
  } catch {
    // a failed role lookup shouldn't sign anyone out
  }

  return res.status(200).json({ user, isStaff, hasSupporterAccess });
}
