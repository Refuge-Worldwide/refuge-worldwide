import { NextApiRequest, NextApiResponse } from "next";
import { assertError } from "ts-extras";
import { getCalendarShows } from "../../lib/contentful/calendar";
import { createClient } from "contentful-management";
import {
  formatArtistsForContenful,
  createReferencesArray,
} from "../../lib/contentful/management";
import dayjs from "dayjs";

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

        const shows = await getCalendarShows(true, start, end);

        res
          .status(200)
          .setHeader("Cache-Control", "s-maxage=1, stale-while-revalidate=59")
          .json(shows);
        break;
      } catch (error) {
        assertError(error);

        console.log(error);

        res.status(400).json({ message: error.message });
      }
    case "POST":
      try {
        const artists = createReferencesArray(values.artists);
        // const artistsForContentful = formatArtistsForContenful(
        //   values.artists,
        //   values.hasExtraArtists,
        //   values.extraArtists
        // );
        const space = await client.getSpace(spaceId);
        const environment = await space.getEnvironment(environmentId);
        const startDateTime = dayjs(values.start + "Z").toISOString();
        const endDateTime = dayjs(values.end + "Z").toISOString();
        console.log("start: " + startDateTime);
        console.log("end: " + endDateTime);
        const entry = await environment.createEntry(showContentTypeId, {
          fields: {
            title: {
              "en-US": values.showName,
            },
            internal: {
              "en-US": values.showName,
            },
            date: {
              "en-US": startDateTime,
            },
            dateEnd: {
              "en-US": endDateTime,
            },
            artists: {
              "en-US": artists,
            },
            status: {
              "en-US": values.status.value,
            },
            booker: {
              "en-US": values.booker,
            },
          },
        });
        console.log(entry);
        res.status(200).json("Show added successfully");
        break;
      } catch (err) {
        console.log(err);
        throw 400;
      }
    case "PATCH":
      console.log(values);
      const startDateTime = dayjs(values.start + "Z").toISOString();
      const endDateTime = dayjs(values.end + "Z").toISOString();
      let artists;
      if (values.artists) {
        artists = createReferencesArray(values.artists);
      }
      //fetch entry using contentfulID
      client
        .getSpace(spaceId)
        .then((space) => space.getEnvironment(environmentId))
        .then((environment) => environment.getEntry(values.contentfulId))
        //update fields with values from form
        .then((entry) => {
          console.log(entry);
          entry.fields.date["en-US"] = startDateTime;
          entry.fields.dateEnd["en-US"] = endDateTime;
          if (values.showName) {
            entry.fields.title["en-US"] = values.showName;
          }
          if (values.artists) {
            entry.fields.artists["en-US"] = artists;
          }
          if (values.status && entry.fields.status) {
            entry.fields.status["en-US"] = values.status.value;
          }
          if (values.booker & entry.fields.booker) {
            entry.fields.booker["en-US"] = values.booker;
          }
          return entry.update();
        })
        .then((entry) => {
          console.log(`Entry ${entry.sys.id} updated.`);
          res.status(200).json({});
        })
        .catch(console.error);
      // let show = getCalendarShow(value.id)
      //Update the resource by passing the changed resource along with current version number.
      break;
    case "DELETE":
      res.status(202).json({});
      break;
  }
}
