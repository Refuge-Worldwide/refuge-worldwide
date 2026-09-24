import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { readUser } from "@directus/sdk";
import { directusMembershipAdmin } from "@/lib/directus/admin";
import { directusUrl, getSessionUser } from "@/lib/directus/session";

type CookieReq = { cookies: Partial<Record<string, string>> };
type HeaderRes = { setHeader(name: string, value: string | string[]): void };

export type UserAccess = {
  isStaff: boolean;
  isPaid: boolean;
  hasSupporterAccess: boolean; // paid, or staff/admin
};

export function isPaidStatus(status?: string | null) {
  return status === "active" || status === "past_due";
}

// admins count as staff too, since a user only has one role
function isStaffRole(role?: string | null) {
  const allowed = [
    process.env.DIRECTUS_STAFF_ROLE_ID,
    process.env.DIRECTUS_ADMIN_ROLE_ID,
  ].filter(Boolean);
  return !!role && allowed.includes(role);
}

// admin token, not the caller's — Staff can't read directus_users itself
export async function getUserAccess(userId: string): Promise<UserAccess> {
  const user = (await directusMembershipAdmin.request(
    readUser(userId, { fields: ["role", "subscription_status"] } as never)
  )) as unknown as {
    role?: string | null;
    subscription_status?: string | null;
  };

  const isStaff = isStaffRole(user.role);
  const isPaid = isPaidStatus(user.subscription_status);
  return { isStaff, isPaid, hasSupporterAccess: isStaff || isPaid };
}

export async function getUserIdFromToken(
  token: string
): Promise<string | null> {
  try {
    const res = await fetch(`${directusUrl}/users/me?fields=id`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return (await res.json()).data?.id ?? null;
  } catch {
    return null;
  }
}

export async function getStaffUser(req: CookieReq, res: HeaderRes) {
  const user = await getSessionUser(req, res, "id,email");
  if (!user) return null;
  const access = await getUserAccess(user.id);
  return access.isStaff ? user : null;
}

export async function requireStaffApi(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<boolean> {
  const user = await getStaffUser(req, res);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

export async function requireStaffPage(context: GetServerSidePropsContext) {
  const user = await getStaffUser(context.req, context.res);
  if (!user) {
    return { redirect: { destination: "/signin", permanent: false } } as const;
  }
  return { props: {} };
}
