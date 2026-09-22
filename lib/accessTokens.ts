import { createItem, readItems, updateItem } from "@directus/sdk";
import { directusMembershipAdmin } from "@/lib/directus/admin";

export type AccessToken = {
  id: number;
  application: string;
  token: string | null;
  refresh_token: string | null;
  expires: string | null;
};

const COLLECTION = "access_tokens";

export async function getAccessTokenRow(
  application: string
): Promise<AccessToken | null> {
  const rows = (await directusMembershipAdmin.request(
    readItems(
      COLLECTION as never,
      {
        filter: { application: { _eq: application } },
        limit: 1,
      } as never
    )
  )) as unknown as AccessToken[];
  return rows[0] ?? null;
}

export async function saveAccessToken(
  application: string,
  data: { token: string; refresh_token: string | null; expires: string }
) {
  const existing = await getAccessTokenRow(application);
  if (existing) {
    await directusMembershipAdmin.request(
      updateItem(COLLECTION as never, existing.id, data as never)
    );
  } else {
    await directusMembershipAdmin.request(
      createItem(COLLECTION as never, { application, ...data } as never)
    );
  }
}
