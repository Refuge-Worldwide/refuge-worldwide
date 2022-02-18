import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check for secret to confirm this is a valid request
  if (req.query.secret !== process.env.MY_SECRET_TOKEN) {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    console.log(
      "Event",
      req.headers["x-contentful-topic"],
      "Webhook Name",
      req.headers["x-contentful-webhook-name"]
    );

    const body = req.body;

    switch (true) {
      /**
       * pageHome ID
       */
      case body.sys.id === "3xN3mbIMb4CwtrZqlRbYyu":
      /**
       * sectionToday ID
       */
      case body.sys.id === "2bP8MlTMBYfe1paaxwwziy":
        await res.unstable_revalidate("/");

        break;

      default:
        break;
    }

    return res.status(200).send("Success!");
  } catch (err) {
    return res.status(500).send("Error Revalidating");
  }
}
