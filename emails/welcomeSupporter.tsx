import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface EmailProps {
  userName: string;
}

// TODO: switch back to "https://refugeworldwide.com/" once this branch
const baseUrl =
  "https://refuge-worldwide-git-supporters-refugeworldwide.vercel.app/";

export const WelcomeSupporterEmail = ({ userName = "Jack" }: EmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Thank you for supporting Refuge Worldwide</Preview>
      <Body style={main}>
        <Container>
          <Section style={logo}>
            <Img
              src={`${baseUrl}images/refuge-logo.png`}
              height={40}
              width={66}
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
                  Thank you for becoming a Refuge Worldwide supporter. Your
                  support keeps independent radio alive and directly funds our
                  broadcasts, programming, and community projects.
                </Text>
                <Text
                  style={{
                    ...paragraph,
                    fontWeight: 600,
                    marginTop: 32,
                    marginBottom: 8,
                    textAlign: "center",
                  }}
                >
                  Download the app to make the most of your membership
                </Text>
                <Row style={{ paddingBottom: 32 }}>
                  <Column align="center">
                    <Link
                      href="https://apps.apple.com/us/app/refuge-worldwide/id6785827225"
                      style={{
                        display: "inline-block",
                        verticalAlign: "middle",
                        marginRight: 12,
                      }}
                    >
                      <Img
                        src={`${baseUrl}images/app-store-badge-email.png`}
                        alt="Download on the App Store"
                        width={143}
                        height={48}
                        style={{ verticalAlign: "middle" }}
                      />
                    </Link>
                    <Link
                      href="https://play.google.com/store/apps/details?id=com.refugeworldwide.app&hl=en-US"
                      style={{
                        display: "inline-block",
                        verticalAlign: "middle",
                      }}
                    >
                      <Img
                        src={`${baseUrl}images/google-play-badge.png`}
                        alt="Get it on Google Play"
                        width={176}
                        height={68}
                        style={{ verticalAlign: "middle" }}
                      />
                    </Link>
                  </Column>
                </Row>
                <Text style={paragraph}>
                  As a supporter, you get access to a range of tools designed to
                  make it easier to keep track of your favourite shows and
                  revisit broadcasts from our archive. You can now save shows
                  and make playlists (coming soon), alongside regularly updated
                  staff picks, various genre spotlights and live sets from
                  festivals. There&apos;s also a new chatroom function, a
                  refreshed on-the-go listening experience, plus an exclusive
                  members area with various benefits.
                </Text>
                <Hr style={seperator} />
                <Text style={{ ...paragraph, marginTop: -5, marginBottom: 0 }}>
                  Thank you, <br />
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

export default WelcomeSupporterEmail;

const main = {
  backgroundColor: "#fff",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const paragraph = {
  fontSize: 16,
  margin: "16px 0px",
};

const logo = {
  margin: "20px auto",
};

const content = {
  border: "1px solid rgb(0,0,0, 1)",
  borderRadius: "0px",
  overflow: "hidden",
};

const seperator = {
  borderTop: "#000 solid 1px",
  margin: "24px 0",
};
