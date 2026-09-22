import { NextApiRequest, NextApiResponse } from "next";
import { requireStaffApi } from "@/lib/directus/staff";
import { sendConfirmationEmail } from "../../../lib/resend/email";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!(await requireStaffApi(req, res))) return;
  const values = req.body;
  console.log("REQUEST METHOD: " + req.method);
  switch (req.method) {
    case "POST":
      try {
        await sendConfirmationEmail(values);
        return res.status(200).json("Confirmation email sent");
      } catch (error) {
        console.log(error);
        return res.status(400).json({ message: error.message });
      }
  }
}
