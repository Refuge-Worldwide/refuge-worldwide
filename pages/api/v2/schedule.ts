import type { NextApiRequest, NextApiResponse } from "next";
import { assertError } from "ts-extras";
import { getScheduleData } from "../../../lib/contentful/schedule";
import { client } from "../../../lib/contentful/client";
import { placeholderImage } from "../../../util";

const CH1_STREAM_URL = "https://streaming.radio.co/s3699c5e49/listen";
const CH2_STREAM_URL = "https://s4.radio.co/s8ce53d687/listen";

type RadioCo = {
  status: "online" | "offline";
  source: {
    type: string;
    collaborator?: any;
    relay?: any;
  };
  collaborators: any[];
  relays: any[];
  current_track: {
    title: string;
    start_time: string;
    artwork_url: string;
    artwork_url_large: string;
  };
  history: { title: string }[];
  logo_url: string;
  streaming_hostname: string;
  outputs: {
    name: string;
    format: string;
    bitrate: number;
  }[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { data, duration } = await getScheduleData();
    let radioCoData: RadioCo | null = null;
    let radioCoDataCh2: RadioCo;

    try {
      const r = await fetch(
        "https://public.radio.co/stations/s3699c5e49/status"
      );

      if (!r.ok) {
        throw new Error(`HTTP error! status: ${r.status}`);
      }

      radioCoData = await r.json();
    } catch (error) {
      console.log("error loading channel 1: " + error.message);
    }

    let ch2Artwork = placeholderImage.url;

    try {
      const ch2 = await fetch(
        "https://public.radio.co/stations/s8ce53d687/status"
      );
      radioCoDataCh2 = await ch2.json();
    } catch (error) {
      console.log("error loading channel 2: " + error.message);
    }

    if (radioCoDataCh2?.status === "online") {
      try {
        const ch2Entry = await client.getEntry("4YKAkm3ifdmBGi7K1GFZSe");
        const image = (ch2Entry.fields.image as any)?.fields?.file?.url;
        if (image) ch2Artwork = image;
      } catch (error) {
        console.log("error loading ch2 image: " + error.message);
      }
    }

    const liveNowContentful = data.schedule.find((show) => show.live);

    let liveNowArtwork = placeholderImage.url;
    if (liveNowContentful && liveNowContentful.coverImage) {
      liveNowArtwork = liveNowContentful.coverImage.url;
    }

    const liveNowTitle = () => {
      const radioTitle = radioCoData?.current_track?.title ?? "";
      if (radioTitle.includes("!OVERWRITE!")) {
        return radioTitle.replace("!OVERWRITE!", "");
      } else if (liveNowContentful) {
        return liveNowContentful.title;
      } else {
        return radioTitle;
      }
    };

    const scheduleData = {
      ch1: {
        status: radioCoData?.status ?? "offline",
        streamUrl: CH1_STREAM_URL,
        liveNow: {
          title: liveNowTitle(),
          artwork: liveNowArtwork,
          link: liveNowContentful ? "/radio/" + liveNowContentful.slug : null,
          slug: liveNowContentful?.slug ?? null,
          isMixedFeelings: liveNowTitle().includes("mixed feelings"),
        },
        nextUp: data.nextUp,
        schedule: data.schedule,
      },
      ch2: {
        status: radioCoDataCh2?.status ?? "offline",
        streamUrl: CH2_STREAM_URL,
        liveNow: {
          title: radioCoDataCh2?.current_track?.title ?? null,
          artwork: ch2Artwork,
        },
      },
    };

    res
      .setHeader("Server-Timing", `schedule;dur=${duration}`)
      .setHeader(
        "Cache-Control",
        "s-maxage=60, stale-while-revalidate=20, stale-if-error=600"
      )
      .json(scheduleData);
  } catch (error) {
    assertError(error);

    res.status(400).json({
      message: error.message,
    });
  }
}
