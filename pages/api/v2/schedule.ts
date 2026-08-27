import type { NextApiRequest, NextApiResponse } from "next";
import { assertError } from "ts-extras";
import { getScheduleData } from "../../../lib/contentful/schedule";
import { client } from "../../../lib/contentful/client";
import { getShowByTitle } from "../../../lib/contentful/search";
import { placeholderImage } from "../../../util";
import { ScheduleShow } from "../../../types/shared";

const CH1_STATION_ID = "s3699c5e49";
const CH2_STATION_ID = "s8ce53d687";
const CH1_STREAM_URL = "https://streaming.radio.co/s3699c5e49/listen";
const CH2_STREAM_URL = "https://s4.radio.co/s8ce53d687/listen";
const CH2_IMAGE_ENTRY_ID = "4YKAkm3ifdmBGi7K1GFZSe";

// radio.co appends "(R)" to the track title when a repeat is airing.
const REPEAT_TAG_REGEX = /\(r\)/i;
const stripRepeatTag = (title: string) =>
  title.replace(REPEAT_TAG_REGEX, "").replace(/\s+/g, " ").trim();

type RadioCo = {
  status: "online" | "offline";
  current_track: {
    title: string;
    start_time: string;
    artwork_url: string;
    artwork_url_large: string;
  };
  [key: string]: any;
};

async function fetchRadioCoStatus(
  stationId: string,
  label: string
): Promise<RadioCo | null> {
  try {
    const res = await fetch(
      `https://public.radio.co/stations/${stationId}/status`
    );
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.log(`error loading ${label}: ` + error.message);
    return null;
  }
}

async function getCh2Artwork(radioCoDataCh2: RadioCo | null) {
  if (radioCoDataCh2?.status !== "online") return placeholderImage.url;

  try {
    const entry = await client.getEntry(CH2_IMAGE_ENTRY_ID);
    const image = (entry.fields.image as any)?.fields?.file?.url;
    return image ?? placeholderImage.url;
  } catch (error) {
    console.log("error loading ch2 image: " + error.message);
    return placeholderImage.url;
  }
}

// What's live on ch1 is either the scheduled Contentful show, or - if
// radio.co is airing a repeat that has fallen outside the schedule window -
// the original show found by matching its title (with the "(R)" tag
// stripped).
async function getCh1LiveNow(
  liveNowContentful: ScheduleShow | undefined,
  radioCoData: RadioCo | null
) {
  const radioTitle = radioCoData?.current_track?.title ?? "";
  const isRepeat = REPEAT_TAG_REGEX.test(radioTitle);

  const repeatShow =
    !liveNowContentful && radioTitle
      ? await getShowByTitle(stripRepeatTag(radioTitle)).catch((error) => {
          console.log("error finding repeat show: " + error.message);
          return null;
        })
      : null;

  const show = liveNowContentful ?? repeatShow;

  const title = radioTitle.includes("!OVERWRITE!")
    ? radioTitle.replace("!OVERWRITE!", "")
    : show?.title ?? (isRepeat ? stripRepeatTag(radioTitle) : radioTitle);

  return {
    title,
    artwork: show?.coverImage?.url ?? placeholderImage.url,
    link: show?.slug ? "/radio/" + show.slug : null,
    slug: show?.slug ?? null,
    isMixedFeelings: title.includes("mixed feelings"),
    repeat: isRepeat,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { data, duration } = await getScheduleData();

    const [radioCoData, radioCoDataCh2] = await Promise.all([
      fetchRadioCoStatus(CH1_STATION_ID, "channel 1"),
      fetchRadioCoStatus(CH2_STATION_ID, "channel 2"),
    ]);

    const [ch2Artwork, ch1LiveNow] = await Promise.all([
      getCh2Artwork(radioCoDataCh2),
      getCh1LiveNow(
        data.schedule.find((show) => show.live),
        radioCoData
      ),
    ]);

    const scheduleData = {
      ch1: {
        status: radioCoData?.status ?? "offline",
        streamUrl: CH1_STREAM_URL,
        liveNow: ch1LiveNow,
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
