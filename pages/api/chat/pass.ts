import type { NextApiRequest, NextApiResponse } from "next";
import { clientIp, hashSenderIp } from "@/lib/chatModeration";
import { issueChatPass, verifyTurnstileToken } from "@/lib/chatPass";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.body?.token;
  if (typeof token !== "string" || !token || token.length > 4096) {
    return res.status(400).json({ error: "Missing verification token" });
  }

  const ip = clientIp(req);
  if (!(await verifyTurnstileToken(token, ip))) {
    return res
      .status(403)
      .json({ error: "Couldn't verify you're human — please try again." });
  }

  return res.status(200).json({ pass: issueChatPass(hashSenderIp(ip)) });
}
