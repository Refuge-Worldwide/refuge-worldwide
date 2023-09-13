import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import ShowSubmissionEmail from "../../emails/showSubmission";
import dayjs from "dayjs";
import { getUpcomingShowsByDate } from "../../lib/contentful/pages/radio";

const resend = new Resend(process.env.RESEND_API_KEY);

const send = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "GET": {
      const now = dayjs();
      const initialEmailDate = now.add(10, "days");
      const followUpEmailDate = now.add(4, "days");
      const finalCallEmailDate = now.add(3, "days");
      const initialShowsToEmail = await getUpcomingShowsByDate(
        initialEmailDate,
        true
      );
      initialShowsToEmail.forEach((show) => {
        //send email
      });
      const followUpShows = await getUpcomingShowsByDate(
        followUpEmailDate,
        true
      );
      followUpShows.forEach((show) => {
        //send email
      });
      const finalCallShows = await getUpcomingShowsByDate(
        finalCallEmailDate,
        true
      );
      finalCallShows.forEach((show) => {
        //send email
      });
      // make call to api /upcoming shows
      // for each initial send email
      // for each follow-up send email
      // for each late send email
      // const data = await resend.sendEmail({
      //   from: "Refuge Worldwide <noreply@mail.refugeworldwide.com>",
      //   to: "muzza454@googlemail.com",
      //   subject: subject("late"),
      //   reply_to: "hello@refugeworldwide.com",
      //   react: ShowSubmissionEmail({
      //     userName: "No Plastic",
      //     showDateStart: "September 7, 2023, 13:00",
      //     showDateEnd: "September 7, 2023, 15:00",
      //     showType: "live",
      //     severity: "late",
      //   }),
      // });

      // return res.status(200).send(data);
    }
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

const subject = (severity: string) => {
  if (severity == "initial") {
    return "Upcoming show - info required";
  } else if (severity == "follow-up") {
    return "Final call for info!";
  } else {
    return "Your submission is late!";
  }
};

export default send;
