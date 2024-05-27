import type { NextApiRequest, NextApiResponse } from "next";
import { assertError } from "ts-extras";
import { getScheduleData } from "../../lib/contentful/schedule";

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
    const r = await fetch("https://public.radio.co/stations/s3699c5e49/status");
    const ch2 = await fetch(
      "https://public.radio.co/stations/s8ce53d687/status"
    );
    const radioCoData: RadioCo = await r.json();
    const radioCoDataCh2: RadioCo = await ch2.json();
    let liveNowArtwork = radioCoData.current_track.artwork_url;
    const liveNowContentful = data.schedule.find((show) => {
      return show.live;
    });

    if (liveNowContentful && liveNowContentful.coverImage) {
      liveNowArtwork = liveNowContentful.coverImage.url;
    }

    const liveNowTitle = () => {
      if (radioCoData.current_track.title.includes("!OVERWRITE!")) {
        return radioCoData.current_track.title.replace("!OVERWRITE!", "");
      } else if (liveNowContentful) {
        return liveNowContentful.title;
      } else {
        return radioCoData.current_track.title;
      }
    };

    const liveNow = {
      title: liveNowTitle(),
      artwork: liveNowArtwork,
      link: liveNowContentful ? "/radio/" + liveNowContentful.slug : null,
    };

    const scheduleData = {
      status: radioCoData.status,
      liveNow: liveNow,
      nextUp: data.nextUp,
      schedule: data.schedule,
      ch2: {
        status: radioCoDataCh2.status,
        liveNow: radioCoDataCh2.current_track.title,
      },
    };

    res
      .setHeader("Server-Timing", `schedule;dur=${duration}`)
      .setHeader(
        "Cache-Control",
        "s-maxage=30, stale-while-revalidate=60, stale-if-error=600"
      )
      .json(scheduleData);
  } catch (error) {
    assertError(error);

    res.status(400).json({
      message: error.message,
    });
  }
}
