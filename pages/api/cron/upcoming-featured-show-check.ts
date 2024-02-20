import type { NextApiRequest, NextApiResponse } from "next";
import dayjs from "dayjs";
import { getUpcomingShows } from "../../../lib/contentful/pages/radio";
import { sendSlackMessage } from "../../../lib/slack";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authHeader = req.headers.authorization;

  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({ success: false });
  }

  try {
    const now = dayjs().format("YYYY-MM-DD");
    const twoWeekFromNow = dayjs().add(2, "week").format("YYYY-MM-DD");
    // get shows in upcoming shows orange section.
    // check again requirements.
    const upcomingShowsIn2Weeks = await getUpcomingShows(false, twoWeekFromNow);

    if (upcomingShowsIn2Weeks.length < 4) {
      const upcomingShows = await getUpcomingShows(false, now, 99);
      const lastFour = upcomingShows.slice(-4);
      const updateBy = dayjs(lastFour[0].date)
        .subtract(1, "day")
        .format("ddd D MMMM");
      sendSlackMessage(
        `🍊 section will drop below the required 4 shows in the next 2 weeks. Please add more featured shows by ${updateBy}.`
      );
    }
    return res.status(200).json({ success: true });

    // if they don't meet requirements then send slack message.
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
}
