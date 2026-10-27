export function sessionToken({ ageSeconds = 0, ttlSeconds = 86_400 } = {}) {
  const iat = Math.floor(Date.now() / 1000) - ageSeconds;
  const payload = Buffer.from(
    JSON.stringify({ id: "u1", session: "s1", iat, exp: iat + ttlSeconds })
  ).toString("base64url");
  return `header.${payload}.sig`;
}

export function directusSessionResponse(token = sessionToken()) {
  return new Response(JSON.stringify({ data: { expires: 86_400_000 } }), {
    status: 200,
    headers: {
      "Set-Cookie": `directus_session_token=${token}; Path=/; HttpOnly`,
    },
  });
}
