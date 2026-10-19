import type { NextApiRequest, NextApiResponse } from "next";
import { deleteFiles, deleteItems, readFiles, readItems } from "@directus/sdk";
import { directusServer } from "@/lib/directus/server";

// weekly, clears out chat messages and photos older than 7 days
const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
// a bit extra so we're never right on Directus's 7 day delete limit
const CLOCK_MARGIN_MS = 10 * 60 * 1000;
const BATCH_SIZE = 200;

const chatImagesFolderId = process.env.DIRECTUS_CHAT_IMAGES_FOLDER_ID;

export const config = {
  maxDuration: 60,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (
    !process.env.CRON_SECRET ||
    req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({ success: false });
  }

  const cutoff = new Date(
    Date.now() - RETENTION_MS - CLOCK_MARGIN_MS
  ).toISOString();

  try {
    let deletedMessages = 0;
    for (;;) {
      const rows = await directusServer.request(
        readItems("chat", {
          filter: { date_created: { _lt: cutoff } },
          fields: ["id"],
          limit: BATCH_SIZE,
        })
      );
      if (rows.length === 0) break;
      await directusServer.request(
        deleteItems(
          "chat",
          rows.map((row) => row.id)
        )
      );
      deletedMessages += rows.length;
      if (rows.length < BATCH_SIZE) break;
    }

    // by upload date, so stray photos from failed sends go too
    let deletedFiles = 0;
    if (chatImagesFolderId) {
      for (;;) {
        const files = await directusServer.request(
          readFiles({
            filter: {
              _and: [
                { folder: { _eq: chatImagesFolderId } },
                { uploaded_on: { _lt: cutoff } },
              ],
            },
            fields: ["id"],
            limit: BATCH_SIZE,
          })
        );
        if (files.length === 0) break;
        await directusServer.request(deleteFiles(files.map((file) => file.id)));
        deletedFiles += files.length;
        if (files.length < BATCH_SIZE) break;
      }
    }

    console.log(
      `[chat-cleanup] deleted ${deletedMessages} messages and ${deletedFiles} photos older than ${cutoff}`
    );
    return res
      .status(200)
      .json({ success: true, deletedMessages, deletedFiles, cutoff });
  } catch (error) {
    console.error("[chat-cleanup] failed:", error);
    return res.status(500).json({ success: false });
  }
}
