import type { NextApiRequest, NextApiResponse } from "next";
import { createItem, readItems } from "@directus/sdk";
import { directusServer } from "@/lib/directus/server";

const SYSTEM_USERNAME = "Refuge Worldwide";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authHeader = req.headers.authorization;

  // if (
  //   !process.env.CRON_SECRET ||
  //   authHeader !== `Bearer ${process.env.CRON_SECRET}`
  // ) {
  //   return res.status(401).json({ success: false });
  // }

  try {
    // Fetch current schedule
    const baseUrl = (
      process.env.NEXT_PUBLIC_SITE_URL ??
      `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    ).replace(/\/$/, "");

    console.log("[chat-show-announce] fetching schedule from", baseUrl);

    const scheduleRes = await fetch(`${baseUrl}/api/schedule`);

    if (!scheduleRes.ok) {
      console.log(
        "[chat-show-announce] schedule fetch failed",
        scheduleRes.status
      );
      return res
        .status(200)
        .json({ success: false, reason: "schedule unavailable" });
    }

    const schedule = await scheduleRes.json();
    console.log(
      "[chat-show-announce] status:",
      schedule.status,
      "title:",
      schedule.liveNow?.title
    );

    if (schedule.status !== "online" || !schedule.liveNow?.title) {
      return res
        .status(200)
        .json({ success: false, reason: "station offline or no title" });
    }

    const { title, artwork } = schedule.liveNow;

    // Check if this show was already announced
    let lastMessage: string | undefined;
    try {
      const lastSystem = await directusServer.request(
        readItems("chat", {
          filter: { username: { _eq: SYSTEM_USERNAME } },
          sort: ["-date_created"],
          limit: 1,
          fields: ["message"],
        })
      );
      lastMessage = lastSystem[0]?.message;
    } catch (fetchError) {
      console.error(
        "[chat-show-announce] fetch last system message error:",
        fetchError
      );
    }

    console.log("[chat-show-announce] last system message:", lastMessage);

    if (lastMessage === title) {
      return res
        .status(200)
        .json({ success: false, reason: "already announced" });
    }

    // Insert system message with show title and artwork. No `user` — system
    // messages are identified purely by username, matching the frontend's
    // check (msg.username === "Refuge Worldwide").
    try {
      await directusServer.request(
        createItem("chat", {
          username: SYSTEM_USERNAME,
          message: title,
          image: artwork ?? null,
        })
      );
    } catch (insertError) {
      console.error("[chat-show-announce] insert error:", insertError);
      return res.status(500).json({
        success: false,
        error:
          insertError instanceof Error
            ? insertError.message
            : String(insertError),
      });
    }

    console.log("[chat-show-announce] inserted:", title);
    return res.status(200).json({ success: true, title });
  } catch (err) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("[chat-show-announce] unexpected error:", message);
    return res.status(500).json({ success: false, error: message });
  }
}
