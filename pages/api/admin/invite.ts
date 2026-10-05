import type { NextApiRequest, NextApiResponse } from "next";
import { inviteUser } from "@directus/sdk";
import { directusMembershipAdmin } from "@/lib/directus/admin";
import { requireAdminApi } from "@/lib/directus/staff";
import { normalizeEmail } from "@/lib/normalizeEmail";

const ROLE_ENV_VARS = {
  friend: "DIRECTUS_FRIEND_ROLE_ID",
  staff: "DIRECTUS_STAFF_ROLE_ID",
} as const;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!(await requireAdminApi(req, res))) return;

  const { emails: rawEmails, role } = req.body as {
    emails?: string[];
    role?: keyof typeof ROLE_ENV_VARS;
  };

  if (
    !Array.isArray(rawEmails) ||
    rawEmails.length === 0 ||
    !role ||
    !(role in ROLE_ENV_VARS)
  ) {
    return res
      .status(400)
      .json({ error: "At least one email and a role are required" });
  }

  const roleId = process.env[ROLE_ENV_VARS[role]];
  if (!roleId) {
    return res.status(500).json({ error: `${ROLE_ENV_VARS[role]} is not set` });
  }

  const emails = Array.from(
    new Set(rawEmails.map((e) => normalizeEmail(e)).filter(Boolean))
  );

  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ??
    `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  ).replace(/\/$/, "");

  const results = await Promise.all(
    emails.map(async (email) => {
      try {
        await directusMembershipAdmin.request(
          inviteUser(email, roleId, `${baseUrl}/account/accept-invite`)
        );
        return { email, ok: true as const };
      } catch (error) {
        console.error("[api/admin/invite] failed for", email, error);
        return { email, ok: false as const };
      }
    })
  );

  return res.status(200).json({
    sent: results.filter((r) => r.ok).map((r) => r.email),
    failed: results.filter((r) => !r.ok).map((r) => r.email),
  });
}
