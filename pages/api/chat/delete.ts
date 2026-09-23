import type { NextApiRequest, NextApiResponse } from "next";
import { directusUrl, getValidAccessToken } from "@/lib/directus/session";
import { getUserAccess, getUserIdFromToken } from "@/lib/directus/staff";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const id = req.body?.id;
  if (typeof id !== "number") {
    return res.status(400).json({ error: "A message id is required" });
  }

  // Deletes with the caller's own token (not the admin/chat-service ones —
  // see lib/directus/admin.ts, lib/directus/server.ts) so Directus's own
  // "Staff" policy (delete on `chat`, see scripts/directus-schema in the app
  // repo) is what  authorizes this.
  const token = await getValidAccessToken(req, res);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = await getUserIdFromToken(token);
  if (!userId || !(await getUserAccess(userId)).isStaff) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const response = await fetch(`${directusUrl}/items/chat/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok && response.status !== 204) {
    console.error(
      "[api/chat/delete] failed to delete message:",
      response.status
    );
    return res.status(500).json({ error: "Failed to delete message" });
  }

  return res.status(200).json({ ok: true });
}
