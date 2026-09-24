import type { NextApiRequest, NextApiResponse } from "next";
import { sendSlackMessage } from "../../lib/slack";
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "POST": {
      const body = req.body;
      console.log(body);
      try {
        if (body.type === "email.bounced") {
          await sendSlackMessage(
            `Submission email bounced to *${body.data.to}*. ${body.data.bounce.message} <https://resend.com/emails/${body.data.email_id}|View email >`
          );
        } else if (body.type === "email.delivery_delayed") {
          await sendSlackMessage(
            `Submission email delivery delayed to *${body.data.to}*. <https://resend.com/emails/${body.data.email_id}|View email >`
          );
        }
        return res.status(200).end();
      } catch (error) {
        return res.status(400).send(error);
      }
    }
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};
