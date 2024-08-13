import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
  Hr,
  Link,
} from "@react-email/components";
import * as React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
var advancedFormat = require("dayjs/plugin/advancedFormat");
dayjs.extend(advancedFormat);
dayjs.extend(utc);
const env = process.env.NODE_ENV;

interface EmailProps {
  userName: string;
  showDate: string;
}

const artworkLinks = [
  process.env.SHOW_ARTWORK_SUN,
  process.env.SHOW_ARTWORK_MON,
  process.env.SHOW_ARTWORK_TUES,
  process.env.SHOW_ARTWORK_WED,
  process.env.SHOW_ARTWORK_THURS,
  process.env.SHOW_ARTWORK_FRI,
  process.env.SHOW_ARTWORK_SAT,
];

const baseUrl = "https://refugeworldwide.com/";

export const ShowArtworkEmail = ({
  userName = "Gramrcy",
  showDate = "2024-05-15T15:00:00.000Z",
}: EmailProps) => {
  const dayOfWeekNo = Number(dayjs(showDate).format("d"));
  const dayOfWeek = dayjs(showDate).format("dddd");
  const artworkLink = artworkLinks[dayOfWeekNo];
  return (
    <Html>
      <Head />
      <Preview>Show artwork</Preview>
      <Body style={main}>
        <Container>
          <Section style={logo}>
            <Img
              src={`https://res.cloudinary.com/dqjn26pey/image/upload/v1706278328/Refuge-pichi_mg1jge.jpg`}
              height={89}
              width={146}
              style={logo}
            />
          </Section>

          <Section style={content}>
            <Row style={{ padding: "24px 30px", borderCollapse: "separate" }}>
              <Column>
                <Heading
                  as="h1"
                  style={{
                    fontSize: 16,
                    textAlign: "left",
                    fontWeight: "normal",
                  }}
                >
                  Hi {userName},{" "}
                </Heading>
                <Text style={paragraph}>
                  You can find artwork for your show on {dayOfWeek}{" "}
                  <Link style={link} href={artworkLink}>
                    here
                  </Link>
                  . If there are any issues please let us know asap!
                </Text>
                <Hr style={seperator} />
                <Heading as="h2" style={paragraph}>
                  <b>IMPORTANT NOTES BELOW, PLEASE READ!</b>
                </Heading>
                <Text style={list}>
                  ⏱️ Please arrive at{" "}
                  <Link
                    href="https://goo.gl/maps/ZY1w74xS4ULk4B1z5"
                    style={link}
                  >
                    Weserstraße 166, 12045
                  </Link>{" "}
                  at least 15 minutes before your show, and let us know ASAP via
                  Whatsapp on 015205492590 if you&apos;re going to be late.
                </Text>
                <Text style={list}>
                  🥃 Hosts / guests receive 1x free drink (please ask at the bar
                  which products are included) and a 15% discount on all other
                  menu items on the day.
                </Text>
                <Text style={list}>
                  🗣️ When mentioning the station on air, our name is “
                  <b>Refuge Worldwide</b>” not “Refuge Radio,” “Refugee
                  Worldwide” or similar.
                </Text>
                <Text style={list}>
                  💬 Encourage people to join the chatroom by shouting out{" "}
                  <Link style={link} href="https://refugeworldwide.com/chat">
                    refugeworldwide.com/chat
                  </Link>{" "}
                  on the mic. Instructions on how to use the mic are in this
                  email and in the DJ booth.
                </Text>
                <Text style={list}>
                  💻 If you need to play something from your laptop or phone, we
                  have an AUX cable connected to Channel 4 on the mixer.
                </Text>
                <Text style={list}>
                  🔄 All shows will be uploaded to our{" "}
                  <Link
                    style={link}
                    href="https://soundcloud.com/refugeworldwide"
                  >
                    SoundCloud
                  </Link>{" "}
                  a day or two after broadcast, feel free to repost!
                </Text>
                <Text style={list}>
                  📲 If you need to download your show, they’re kept{" "}
                  <Link style={link} href="https://bit.ly/refuge-show-dl">
                    here
                  </Link>{" "}
                  for one month (shows may take up to three days from the date
                  of recording to appear here)
                </Text>
                <br />
                <Heading as="h2" style={paragraph}>
                  <b>MIXER OVERVIEW</b>
                </Heading>
                <Img
                  src={`https://res.cloudinary.com/dqjn26pey/image/upload/v1712756321/DJM_Annotated_v2-pichi-1_fkkw36.jpg`}
                  height={750}
                  width={600}
                  style={logo}
                />
                <Heading as="h2" style={paragraph}>
                  <b>HOW TO USE THE MIC</b>
                </Heading>
                <Img
                  src={`https://res.cloudinary.com/dqjn26pey/image/upload/v1713795088/Refuge-studio-signage-mic-v5-mailer-auto2-pichi_e8psbu.jpg`}
                  height={537}
                  width={600}
                  style={logo}
                  alt="1. Put your headphones on.
                  2. Turn the MIXING knob (above the PHONES LEVEL knob) to
                  MASTER, so you can hear yourself in the headphones.
                  3. Make sure the MASTER channel's CUE button is on.
                  4. Switch the mic to ON (light turns solid red).
                  5. Turn down the channel currently playing music to 3.
                  6. Speak closely and clearly into the front of the mic.
                  When you're finished, just reverse the process above!"
                />
                <Text style={paragraph}></Text>
                <Text style={paragraph}>
                  If you have any questions please don&apos;t hesitate to get in
                  touch.
                </Text>
                <Hr style={seperator} />
                <Text style={{ ...paragraph, marginTop: -5, marginBottom: 0 }}>
                  Best, <br />
                  Refuge Worldwide team
                </Text>
              </Column>
            </Row>
          </Section>
          <Text
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "rgb(0,0,0, 0.7)",
              width: "75%",
              margin: "16px auto",
            }}
          >
            refugeworldwide.com
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ShowArtworkEmail;

const main = {
  backgroundColor: "#fff",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const paragraph = {
  fontSize: 16,
  margin: "16px 0px",
};

const link: React.CSSProperties = {
  fontSize: 16,
  color: "#000",
  textDecoration: "underline",
  fontWeight: 500,
};

const logo = {
  margin: "20px auto",
};

const containerButton = {
  justifyContent: "center",
  width: "100%",
};

const button = {
  cursor: "pointer",
  borderRadius: "18px",
  border: "1.5px solid #000",
  background: "#FF9300",
  fontWeight: 600,
  color: "#000",
};

const content = {
  border: "1px solid rgb(0,0,0, 1)",
  borderRadius: "0px",
  overflow: "hidden",
};

const containerImageFooter = {
  padding: "45px 0 0 0",
};

const seperator = {
  borderTop: "#000 solid 1px",
  margin: "24px 0",
};

const list = {
  fontSize: 16,
  margin: "0px 0px 12px 0px",
};
