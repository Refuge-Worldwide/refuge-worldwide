import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase/client";

const SYSTEM_USERNAME = "Refuge Worldwide";
const SYSTEM_USER_ID = "cldf0werf0000l2o1xg5i9y";

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

    // Check if this show was already announced — use maybeSingle to avoid error when no rows exist
    const { data: lastSystem, error: fetchError } = await supabase
      .from("chat")
      .select("message")
      .is("user_id", SYSTEM_USER_ID)
      .eq("username", SYSTEM_USERNAME)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error(
        "[chat-show-announce] fetch last system message error:",
        fetchError
      );
    }

    console.log(
      "[chat-show-announce] last system message:",
      lastSystem?.message
    );

    if (lastSystem?.message === title) {
      return res
        .status(200)
        .json({ success: false, reason: "already announced" });
    }

    // Insert system message with show title and artwork
    const { error: insertError } = await supabase.from("chat").insert({
      user_id: SYSTEM_USER_ID,
      username: SYSTEM_USERNAME,
      message: title,
      image: artwork ?? null,
    });

    if (insertError) {
      console.error("[chat-show-announce] insert error:", insertError);
      return res.status(500).json({
        success: false,
        error: insertError.message,
        details: insertError.details,
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
