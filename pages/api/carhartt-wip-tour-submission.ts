import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleSpreadsheet } from "google-spreadsheet";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const CARHARTT_TOUR_SPREADSHEET_ID = process.env.CARHARTT_TOUR_SPREADSHEET_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_SERVICE_PRIVATE_KEY = process.env.GOOGLE_SERVICE_PRIVATE_KEY;

const doc = new GoogleSpreadsheet(CARHARTT_TOUR_SPREADSHEET_ID);

// Append Function
const appendToSpreadsheet = async (values) => {
  let backgroundOther;
  if (values.background == "Other") {
    backgroundOther = values.backgroundOther;
  }
  const newRow = {
    Timestamp: dayjs().tz("Europe/Berlin").format("DD/MM/YYYY HH:mm:ss"),
    Workshop: values.workshop.value,
    Name: values.name,
    Pronouns: values.pronouns,
    Email: values.email,
    Number: values.number,
    Background: values.background,
    "Background other": backgroundOther,
    Experience: values.experience,
    "Experience explained": values.experienceExplained,
    "How did you hear about these workshops?": values.hear,
  };

  try {
    await doc.useServiceAccountAuth({
      client_email: GOOGLE_CLIENT_EMAIL,
      private_key: GOOGLE_SERVICE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
    // loads document properties and worksheets
    await doc.loadInfo();

    const sheet = doc.sheetsByTitle[values.workshop.value];
    await sheet.addRow(newRow);
  } catch (e) {
    console.error("Error: ", e);
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get data submitted in request's body.
  const values = req.body;
  console.log(values);
  console.log(dayjs().utcOffset());
  try {
    await appendToSpreadsheet(values);
    console.log("tour form submitted successfully");
    res.status(200).json({ data: "successfully submitted :)" });
  } catch (err) {
    res.status(400).json({ data: "issue submitting form" });
  }
}
