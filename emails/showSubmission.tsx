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
var advancedFormat = require("dayjs/plugin/advancedFormat");
dayjs.extend(advancedFormat);

interface EmailProps {
  userName: string;
  showDateStart: string;
  showDateEnd: string;
  showType: "live" | "pre-record";
  severity: "initial" | "follow-up" | "late";
  showId: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "localhost:3001";

export const ShowSubmissionEmail = ({
  userName = "No Plastic",
  showDateStart = "2023-10-02T15:00:00.000Z",
  showDateEnd = "2023-10-02T17:00:00.000Z",
  showType = "live",
  severity = "late",
  showId = "3mJ2xrYzyd4NOwMry3wJJQ",
}: EmailProps) => {
  const startDate = dayjs(showDateStart);
  const formattedDate =
    startDate.format("dddd Do MMMM, HH:mm") +
    "-" +
    dayjs(showDateEnd).format("HH:mm");
  const submissionDeadlineDate = startDate
    .subtract(4, "day")
    .format("dddd Do MMMM");

  return (
    <Html>
      <Head />
      <Preview>{preview(severity)}</Preview>
      <Body style={main}>
        <Container>
          <Section style={logo}>
            <Img
              src={`https://res.cloudinary.com/dqjn26pey/image/upload/v1692697351/refuge-worldwide-logo_y2u1qh.png`}
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
                  {severity == "follow-up" && (
                    <span style={{ fontWeight: "bold" }}>
                      Final call for info!{" "}
                    </span>
                  )}
                  {severity == "late" && (
                    <span style={{ fontWeight: "bold" }}>
                      Your submission is late!{" "}
                    </span>
                  )}
                  You have a show with us on {formattedDate} and we need some
                  info from you ahead of this. Please fill out{" "}
                  <Link style={link}>this submission form</Link>{" "}
                  {severityText(severity, submissionDeadlineDate)}
                </Text>
                <Button
                  href={baseUrl + "/new-submission?id=" + showId}
                  style={button}
                  pY={9}
                  pX={12}
                >
                  SHOW SUBMISSION FORM
                </Button>
                <Hr style={seperator} />
                <Heading as="h2" style={paragraph}>
                  <b>Your upcoming show</b>
                </Heading>
                <Text style={{ ...paragraph, marginTop: -5 }}>
                  Date: {formattedDate}
                  <br />
                  Location:{" "}
                  {showType == "live" ? (
                    <Link
                      href="https://goo.gl/maps/ZY1w74xS4ULk4B1z5"
                      style={link}
                    >
                      Weserstraße 166, 12045
                    </Link>
                  ) : (
                    "Online"
                  )}
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
            © 2023 | Location copyright info | refugeworldwide.com
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const severityText = (level: string, date: string) => {
  if (level == "initial") {
    return (
      <span>
        by{" "}
        <span
          style={{
            color: "#FF0000",
            display: "inline",
            fontWeight: "bold",
          }}
        >
          {date}
        </span>
      </span>
    );
  } else if (level == "follow-up") {
    return (
      <span>
        <span
          style={{
            color: "#FF0000",
            display: "inline",
            fontWeight: "bold",
          }}
        >
          as soon as you can
        </span>{" "}
        and no later than tomorrow.
      </span>
    );
  } else {
    return (
      <span>
        <span
          style={{
            color: "#FF0000",
            display: "inline",
            fontWeight: "bold",
          }}
        >
          by the end of today{" "}
        </span>
        otherwise we will have to sadly cancel your show.
      </span>
    );
  }
};

export const preview = (severity: string) => {
  if (severity == "initial") {
    return "You have a show with us soon and we need some info.";
  } else if (severity == "follow-up") {
    return "You have a show with us soon and we need info from you very soon.";
  } else {
    return "You have a show with us very soon and we need some info ASAP!";
  }
};

export default ShowSubmissionEmail;

const main = {
  backgroundColor: "#fff",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const paragraph = {
  fontSize: 16,
  margin: "16px 0px",
};

const link = {
  fontSize: 16,
  color: "#000",
  textDecoration: "underline",
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
