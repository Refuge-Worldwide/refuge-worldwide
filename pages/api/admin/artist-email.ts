import { NextApiRequest, NextApiResponse } from "next";
import { updateArtistEmail } from "../../../lib/contentful/calendar";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const values = req.body;
  console.log("REQUEST METHOD: " + req.method);
  switch (req.method) {
    case "POST":
      try {
        await updateArtistEmail(values.id, values.email);
        res.status(200).json("Artist email updated");
      } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
      }
  }
}
