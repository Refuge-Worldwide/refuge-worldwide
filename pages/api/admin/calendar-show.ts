import { NextApiRequest, NextApiResponse } from "next";
import {
  deleteCalendarShow,
  createCalendarShow,
  updateCalendarShow,
  createArtist,
} from "../../../lib/contentful/calendar";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("REQUEST METHOD: " + req.method);
  const values = req.body;

  switch (req.method) {
    case "POST":
      try {
        if (values.hasExtraArtists) {
          for (const artist of values.extraArtists) {
            console.log("adding artist to contentful: " + artist.name);
            const contentfulNewArtist = await createArtist(artist);
            values.artists.push(contentfulNewArtist);
          }
        }
        const show = await createCalendarShow(values);
        return res
          .status(200)
          .json({ message: "show created", id: show.sys.id });
      } catch (error) {
        console.log(error);
        return res.status(400).json({ message: error.message });
      }
    case "PUT":
      try {
        if (values.hasExtraArtists) {
          for (const artist of values.extraArtists) {
            console.log("adding artist to contentful: " + artist.name);
            const contentfulNewArtist = await createArtist(artist);
            values.artists.push(contentfulNewArtist);
          }
        }
        const show = await updateCalendarShow(values);
        return res
          .status(200)
          .json({ message: "show updated", id: show.sys.id });
      } catch (error) {
        console.log(error);
        return res.status(400).json({ message: error.message });
      }
    case "DELETE":
      try {
        await deleteCalendarShow(values);
        return res.status(200).json("Show deleted");
      } catch (error) {
        console.log(error);
        return res.status(400).json({ message: error.message });
      }
  }
}
