import { NextApiRequest, NextApiResponse } from "next";
import { sendSlackMessage } from "@/lib/slack";
import { syncPlaylistToSoundcloud } from "@/lib/soundcloud/syncPlaylist";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (process.env.CF_WEBHOOK_SECRET !== req.headers["webhook_secret"]) {
    return res.status(401).json({ message: "Invalid Secret" });
  }

  const fields = JSON.parse(req.body)?.fields;
  const title: string = fields?.title?.["en-US"] ?? "untitled";
  const soundcloudLink: string | undefined = fields?.soundcloudLink?.["en-US"];
  const showIds: string[] = (fields?.shows?.["en-US"] ?? []).map(
    (link: { sys: { id: string } }) => link.sys.id
  );

  if (!soundcloudLink) {
    return res.json({ synced: false });
  }

  try {
    const result = await syncPlaylistToSoundcloud({
      title,
      soundcloudLink,
      showIds,
    });

    if (result.failedShows.length) {
      await sendSlackMessage(
        `⚠️ Playlist sync for "${title}": couldn't find ${
          result.failedShows.length
        } show(s) on SoundCloud, so they were left out: ${result.failedShows.join(
          ", "
        )}`,
        "error"
      );
    }

    return res.json({
      synced: true,
      changed: result.changed,
      tracks: result.tracks,
      failed: result.failedShows.length,
    });
  } catch (error) {
    console.error("[revalidate/playlists] Error:", error);
    await sendSlackMessage(
      `🚨 Playlist sync failed for "${title}": ${error}`,
      "error"
    );
    return res.status(500).send("Error syncing playlist");
  }
}
