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
  showDateStart: string;
  showDateEnd: string;
  showType: "Live" | "Pre-record";
  severity: "confirmation" | "confirmation" | "initial" | "follow-up" | "late";
  showId: string;
}

// const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
//   ? `https://${process.env.NEXT_PUBLIC_SITE_URL}`
//   : "http://localhost:3000/";

const baseUrl = "https://refugeworldwide.com/";

export const ShowSubmissionEmail = ({
  userName = "Gramrcy",
  showDateStart = "2024-05-15T15:00:00.000Z",
  showDateEnd = "2024-05-15T17:00:00.000Z",
  showType = "Live",
  severity = "confirmation",
  showId = "7JIvNxsqyZcPZsw2PJGzIx",
}: EmailProps) => {
  const startDate = dayjs(showDateStart).utc();
  let formattedDate =
    startDate.format("dddd Do MMMM, HH:mm") +
    "-" +
    dayjs(showDateEnd).utc().format("HH:mm CET");
  if (showType == "Pre-record") {
    formattedDate = startDate.format("dddd Do MMMM");
  }
  const submissionDeadlineDate = startDate
    .subtract(4, "day")
    .format("dddd Do MMMM");
  const submitUrl = baseUrl + "submission-v2?id=" + showId;
  const showFormLink = startDate.diff(dayjs(), "day") < 10;
  return (
    <Html>
      <Head />
      <Preview>{preview(severity)}</Preview>
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

                {severity == "confirmation" ? (
                  <Text style={paragraph}>
                    This email confirms your show on Refuge Worldwide on{" "}
                    {formattedDate}.
                    {!showFormLink && (
                      <>
                        {" "}
                        You’ll receive an email from us closer to your show date
                        – in the meantime, please feel free to add it to your
                        calendar.
                      </>
                    )}{" "}
                    We look forward to welcoming you to the station!
                    {showFormLink && (
                      <>
                        {" "}
                        Please fill out the{" "}
                        <Link style={link} href={submitUrl}>
                          submission form
                        </Link>{" "}
                        linked below as soon as possible and by{" "}
                        <span
                          style={{
                            color: "#FF0000",
                            display: "inline",
                            fontWeight: "bold",
                          }}
                        >
                          {submissionDeadlineDate} at the latest
                        </span>
                        .
                      </>
                    )}
                  </Text>
                ) : (
                  <Text style={paragraph}>
                    {severity == "follow-up" && <>Final call for info! </>}
                    {severity == "late" && (
                      <span style={{ fontWeight: "bold" }}>
                        Your submission is late!{" "}
                      </span>
                    )}
                    We need some essential information ahead of your show on{" "}
                    {formattedDate}. Please fill out the{" "}
                    <Link style={link} href={submitUrl}>
                      submission form
                    </Link>{" "}
                    linked below{" "}
                    {severityText(severity, submissionDeadlineDate)}.
                  </Text>
                )}
                {showFormLink && (
                  <>
                    <Button href={submitUrl} style={button} pY={9} pX={12}>
                      SHOW SUBMISSION FORM
                    </Button>
                  </>
                )}
                <Hr style={seperator} />
                <Heading as="h2" style={paragraph}>
                  <b>Your upcoming show</b>
                </Heading>
                <Text style={{ ...paragraph, marginTop: -5 }}>
                  Date: {formattedDate}
                  <br />
                  {showType == "Live" && (
                    <>
                      Location:{" "}
                      <Link
                        href="https://goo.gl/maps/ZY1w74xS4ULk4B1z5"
                        style={link}
                      >
                        Weserstraße 166, 12045
                      </Link>
                    </>
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
            refugeworldwide.com
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
        as soon as possible and by{" "}
        <span
          style={{
            color: "#FF0000",
            display: "inline",
            fontWeight: "bold",
          }}
        >
          {date} at the latest
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
          as soon as possible
        </span>{" "}
        and no later than tomorrow
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
        otherwise we will have to sadly cancel your show
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
