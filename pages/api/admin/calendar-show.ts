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
  console.log(values);

  switch (req.method) {
    case "POST":
      try {
        if (values.hasExtraArtists) {
          for (const artist of values.extraArtists) {
            console.log("adding artist to contentful: " + artist.name);
            const contentfulNewArtist = await createArtist(artist);
            console.log(contentfulNewArtist);
            values.artists.push(contentfulNewArtist);
          }
        }
        const show = await createCalendarShow(values);
        res.status(200).json(show.sys.id);
      } catch (err) {
        console.log(err);
        res.status(400).json({ message: err.message });
      }
    case "PUT":
      try {
        if (values.hasExtraArtists) {
          for (const artist of values.extraArtists) {
            console.log("adding artist to contentful: " + artist.name);
            const contentfulNewArtist = await createArtist(artist);
            console.log(contentfulNewArtist);
            values.artists.push(contentfulNewArtist);
          }
        }
        const show = await updateCalendarShow(values);
        res.status(200).json("Show updated");
      } catch (err) {
        console.log(err);
        res.status(400).json({ message: err.message });
      }
    case "DELETE":
      try {
        await deleteCalendarShow(values);
        res.status(200).json("Show deleted");
      } catch (err) {
        console.log(err);
        res.status(400).json({ message: err.message });
      }
  }
}
