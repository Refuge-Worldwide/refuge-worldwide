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
    let radioCoData: RadioCo;
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
      throw new Error(error.message);
    }

    try {
      const ch2 = await fetch(
        "https://public.radio.co/stations/s8ce53d687/status"
      );
      radioCoDataCh2 = await ch2.json();
    } catch (error) {
      console.log("error loading channel 2: " + error.message);
    }

    let liveNowArtwork = radioCoData?.current_track.artwork_url;
    const liveNowContentful = data.ch1.schedule.find((show) => {
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
      slug:
        liveNowContentful && liveNowContentful.slug
          ? liveNowContentful.slug
          : null,
    };

    const scheduleData = {
      ch1: {
        status: radioCoData.status,
        liveNow: liveNow,
        nextUp: data.ch1.nextUp,
        schedule: data.ch1.schedule,
      },
      ch2: {
        status: radioCoDataCh2?.status,
        liveNow: radioCoDataCh2?.current_track?.title,
        schedule: [
          {
            title: "Channel 2 Show",
            date: "2024-11-01T09:00:00.000Z",
            dateEnd: "2024-11-01T11:00:00.000Z",
            slug: "the-breakfast-show-ella-victoria-01-nov-2024",
            artistsCollection: {
              items: [
                {
                  name: "Ella Victoria",
                  slug: "ella-victoria",
                },
              ],
            },
            coverImage: {
              sys: {
                id: "52GPUxEyJCP4EnQeu9G6HI",
              },
              url: "https://images.ctfassets.net/taoiy3h84mql/52GPUxEyJCP4EnQeu9G6HI/f2767249a2aefc04d97fc1ae369e88c3/632548a4-7365-4cab-bb55-9f8dff4e577a.JPG",
            },
          },
        ],
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
