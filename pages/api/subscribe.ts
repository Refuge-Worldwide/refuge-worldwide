import type { NextApiRequest, NextApiResponse } from "next";
import { subscribeToNewsletter } from "@/lib/mailchimp";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      error: "Email is required",
    });
  }

  try {
    const result = await subscribeToNewsletter(email);

    if (result.ok === false) {
      return res.status(400).json({
        error: `There was an error subscribing to the newsletter. Shoot us an email at [hello@refugeworldwide.com] and we'll add you to the list.`,
      });
    }

    if (result.alreadySubscribed) {
      return res.status(201).json({
        error: "You're already subscribed!",
      });
    }

    return res.status(201).json({
      error: "",
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || error.toString(),
    });
  }
}
