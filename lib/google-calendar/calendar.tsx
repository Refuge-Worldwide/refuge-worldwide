const { google } = require("googleapis");
const GOOGLE_SERVICE_PRIVATE_KEY = process.env.GOOGLE_SERVICE_PRIVATE_KEY;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const SCOPES = "https://www.googleapis.com/auth/calendar";

var auth = new google.auth.JWT(
  GOOGLE_CLIENT_EMAIL,
  null,
  GOOGLE_SERVICE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  SCOPES,
  GOOGLE_CLIENT_EMAIL
);

const calendar = google.calendar({ version: "v3", auth });

export async function getGCalShows(start, end) {
  const calendarShows = await calendar.events.list({
    calendarId:
      "cfee9cd1122cae221b475541f725f87aa2ce04f4d9330e655feba8f212561a84@group.calendar.google.com",
    timeMin: start + "+01:00",
    timeMax: end + "+01:00",
    singleEvents: true,
    orderBy: "startTime",
  });

  const processed = calendarShows.data.items.map((show) => {
    return {
      id: show.id,
      title: show.summary,
      start: show.start.dateTime,
      end: show.end.dateTime,
      status: "Submitted",
      published: true,
      backgroundColor: "#B3DCC1",
      borderColor: "#B3DCC1",
      booker: "",
    };
  });
  return processed;
}
