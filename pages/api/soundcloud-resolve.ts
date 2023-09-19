import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase/client";
import dayjs from "dayjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ string }>
) {
  const now = dayjs();
  let accessToken = null;
  try {
    let { data: accessTokens, error } = await supabase
      .from("accessTokens")
      .select("application, token, refresh_token, expires")
      .eq("application", "soundcloud")
      .limit(1)
      .single();

    // check if token needs to be refreshed
    if (now.isAfter(dayjs(accessTokens.expires))) {
      //refresh token from soundcloud
      const response = await fetch("https://api.soundcloud.com/oauth2/token", {
        method: "POST",
        body: new URLSearchParams({
          client_id: "e13CLA6PxePeodWrLYfcBTg2UHLxD5Kw",
          client_secret: "66lVVFsTBspxdCp4HJwvFhAkeFgZqVAo",
          grant_type: "client_credentials",
        }),
      });

      const body = await response.json();
      //set new access token
      accessToken = body.access_token;
      console.log(body);

      console.log(now.add(body.expires_in - 30, "seconds").toISOString());

      //update supabase details
      const { error } = await supabase
        .from("accessTokens")
        .update({
          token: body.access_token,
          refresh_token: body.refresh_token,
          expires: now.add(body.expires_in - 30, "seconds").toISOString(),
        })
        .eq("application", "soundcloud")
        .select();
    } else {
      //set existing access token
      accessToken = accessTokens.token;
    }

    // get show id from soundcloud
    const { url } = req.query as typeof req.query & {
      url: string;
    };

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

    const body = await response.json();

    if (response.status != 200) {
      res
        .status(response.status)
        .json(body.statusText ? body.statusText : "Error");
    }
    res.status(200).json(body.id);
  } catch (error) {
    console.log(error);

    res.status(400).json(error);
  }
}
