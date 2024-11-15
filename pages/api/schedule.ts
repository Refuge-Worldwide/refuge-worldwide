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
    let radioCoDataCh1: RadioCo;
    let radioCoDataCh2: RadioCo;

    try {
      const ch1 = await fetch("https://public.radio.co/stations/s36e49/status");

      if (!ch1.ok) {
        throw new Error(`HTTP error! status: ${ch1.status}`);
      }

      radioCoDataCh1 = await ch1.json();
    } catch (error) {
      console.error("Failed to fetch ch1 data:", error);
    }

    try {
      const ch2 = await fetch(
        "https://public.radio.co/stations/s8ce53d687/status"
      );

      if (!ch2.ok) {
        throw new Error(`HTTP error! status: ${ch2.status}`);
      }

      radioCoDataCh2 = await ch2.json();
    } catch (error) {
      console.log("Failed to fetch ch1 data:" + error);
    }

    let liveNowArtwork = radioCoDataCh1?.current_track.artwork_url;
    const liveNowContentful = data.schedule.find((show) => {
      return show.live;
    });

    if (liveNowContentful && liveNowContentful.coverImage) {
      liveNowArtwork = liveNowContentful.coverImage.url;
    }

    const liveNowTitle = () => {
      if (radioCoDataCh1?.current_track.title.includes("!OVERWRITE!")) {
        return radioCoDataCh1?.current_track.title.replace("!OVERWRITE!", "");
      } else if (liveNowContentful) {
        return liveNowContentful.title;
      } else if (radioCoDataCh1?.current_track.title) {
        return radioCoDataCh1.current_track.title;
      } else {
        return "Refuge Worldwide";
      }
    };

    const liveNow = {
      title: liveNowTitle(),
      artwork: liveNowArtwork,
      link: liveNowContentful ? "/radio/" + liveNowContentful.slug : null,
      slug:
        liveNowContentful && liveNowContentful.slug
          ? liveNowContentful.slug
          : null,
    };

    const scheduleData = {
      status: radioCoDataCh1 ? radioCoDataCh1?.status : "online",
      liveNow: liveNow,
      nextUp: data.nextUp,
      schedule: data.schedule,
      ch2: {
        status: radioCoDataCh2 ? radioCoDataCh2?.status : "online",
        liveNow: radioCoDataCh2?.current_track?.title,
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
