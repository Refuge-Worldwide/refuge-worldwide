const APPLICATION = "soundcloud";
const TOKEN_URL = "https://secure.soundcloud.com/oauth/token";

type TokenRow = {
  token: string;
  refresh_token: string;
  expires: string;
};

const supabaseRequest = (query: string, init: RequestInit = {}) =>
  fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/accessTokens?${query}`,
    {
      ...init,
      headers: {
        apikey: process.env.SUPABASE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_KEY}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
    }
  );

async function readRow(): Promise<TokenRow> {
  const response = await supabaseRequest(
    `application=eq.${APPLICATION}&select=token,refresh_token,expires`
  );
  const [row] = await response.json();
  if (!row?.refresh_token) {
    throw new Error("No SoundCloud token found in Supabase accessTokens");
  }
  return row;
}

const isValid = (row: TokenRow) => Date.now() < Date.parse(row.expires);

export async function getSoundcloudUserToken(): Promise<string> {
  const row = await readRow();
  if (isValid(row)) return row.token;

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.SC_CLIENT_ID,
      client_secret: process.env.SC_CLIENT_SECRET,
      refresh_token: row.refresh_token,
    }),
  });
  const body = await response.json();

  if (!body.access_token || !body.refresh_token) {
    const latest = await readRow();
    if (isValid(latest)) return latest.token;
    throw new Error(`SoundCloud token refresh failed: ${JSON.stringify(body)}`);
  }

  const expires = new Date(Date.now() + ((body.expires_in ?? 3600) - 60) * 1000)
    .toISOString()
    .replace(/\.\d{3}Z$/, "+00:00");

  const saved = await supabaseRequest(`application=eq.${APPLICATION}`, {
    method: "PATCH",
    body: JSON.stringify({
      token: body.access_token,
      refresh_token: body.refresh_token,
      expires,
    }),
  });
  if (!saved.ok) {
    throw new Error(`Saving SoundCloud token failed: ${await saved.text()}`);
  }

  return body.access_token;
}
