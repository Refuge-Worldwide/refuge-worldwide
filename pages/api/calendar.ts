import { NextApiRequest, NextApiResponse } from "next";
import { assertError } from "ts-extras";
import { getCalendarShows } from "../../lib/contentful/calendar";
import { createClient } from "contentful-management";
import {
  formatArtistsForContenful,
  createReferencesArray,
} from "../../lib/contentful/management";
import dayjs from "dayjs";
const { google } = require("googleapis");
const GOOGLE_SERVICE_PRIVATE_KEY = process.env.GOOGLE_SERVICE_PRIVATE_KEY;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const SCOPES = "https://www.googleapis.com/auth/calendar";

var auth = new google.auth.JWT(
  GOOGLE_CLIENT_EMAIL,
  null,
  GOOGLE_SERVICE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  SCOPES,
  GOOGLE_CLIENT_EMAIL
);

const calendar = google.calendar({ version: "v3", auth });

const accesstoken = process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN;
const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const client = createClient({
  accessToken: accesstoken,
});
const environmentId = process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT_ID;
const showContentTypeId = "show";
const artistContentTypeId = "artist";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const values = req.body;
  console.log("REQUEST METHOD: " + req.method);
  switch (req.method) {
    case "GET":
      try {
        console.log(req.query);
        const { start, end } = req.query as typeof req.query & {
          start: string;
          end: string;
        };

        const calendarShows = await calendar.events.list({
          calendarId:
            "cfee9cd1122cae221b475541f725f87aa2ce04f4d9330e655feba8f212561a84@group.calendar.google.com",
          timeMin: start + "+01:00",
          timeMax: end + "+01:00",
          singleEvents: true,
          orderBy: "startTime",
        });

        const processed = calendarShows.data.items.map((show) => {
          return {
            id: show.id,
            title: show.summary,
            start: show.start.dateTime,
            end: show.end.dateTime,
            status: "Submitted",
            published: true,
            backgroundColor: "#B3DCC1",
            borderColor: "#B3DCC1",
            booker: "",
          };
        });
        console.log(calendarShows.data.items);
        console.log(processed);

        const shows = await getCalendarShows(start, end, true);

        // remove any shows from contentful that have g cal id.
        // shows.forEach(show => {
        //   if (show.gCalEventId) {
        //     console.log('found show with g cal id')
        //     console.log(show)
        //     const index = processed.findIndex((event) => event.id == show.gCalEventId)
        //     processed.splice(index, 1)
        //   }
        // });

        processed.forEach((gCalShow) => {
          const index = shows.findIndex(
            (show) => show.id == gCalShow.gCalEventId
          );
          //remove shows from shows array
          shows.splice(index, 1);
          //update gcal show accordingly with: contentful id, artists, title
        });

        // add shows from contentful but show a warning next to them as unlinked to gcal.

        const combined = shows.concat(processed);

        res
          .status(200)
          .setHeader("Cache-Control", "s-maxage=1, stale-while-revalidate=59")
          .json(combined);
        break;
      } catch (error) {
        assertError(error);

        console.log(error);

        res.status(400).json({ message: error.message });
      }
  }
}
