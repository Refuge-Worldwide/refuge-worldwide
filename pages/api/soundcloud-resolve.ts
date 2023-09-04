import { NextApiRequest, NextApiResponse } from "next";
import { assertError } from "ts-extras";
import { getPastShows } from "../../lib/contentful/client";
import { PastShowSchema } from "../../types/shared";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ string }>
) {
  try {
    const { url } = req.query as typeof req.query & {
      url: string;
    };

    const accessToken = process.env.SC_KEY;

    const response = await fetch(
      `https://api.soundcloud.com/resolve?url=${url}`,
      {
        method: "GET",
        headers: {
          Authorization: `OAuth ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(response);
    console.log(url);

    const body = await response.json();

    res.json(body.id);
  } catch (error) {
    console.log(error);
  }
}
