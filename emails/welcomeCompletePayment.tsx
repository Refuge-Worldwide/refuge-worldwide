import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface EmailProps {
  userName: string;
  supportersUrl: string;
  reminder?: boolean;
}

const baseUrl = "https://refugeworldwide.com/";

export const WelcomeCompletePaymentEmail = ({
  userName = "there",
  supportersUrl = "https://refugeworldwide.com/supporters/checkout",
  reminder = false,
}: EmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{preview(reminder)}</Preview>
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
                  {reminder
                    ? "Just a nudge — you're almost there! You still need to confirm your account and activate your subscription by paying at the link below. Thank you for keeping independent radio alive."
                    : "Thank you for signing up to become a Refuge Worldwide supporter. Your support keeps independent radio alive and directly funds our broadcasts, programming, and community projects."}
                </Text>
                {!reminder && (
                  <Text style={paragraph}>
                    To finish, confirm your account and activate your
                    subscription by paying at the link below. Once your payment
                    goes through, your supporter features will be active across
                    the app and our website.
                  </Text>
                )}
                <Button href={supportersUrl} style={button} pY={9} pX={12}>
                  CONFIRM ACCOUNT &amp; ACTIVATE SUBSCRIPTION
                </Button>
                <Text style={{ ...paragraph, marginTop: 32 }}>
                  As a supporter, you get access to a range of tools designed to
                  make it easier to keep track of your favourite shows and
                  revisit broadcasts from our archive. You can save shows and
                  make playlists (coming soon), alongside regularly updated
                  staff picks, various genre spotlights and live sets from
                  festivals. There&apos;s also a new chatroom function, a
                  refreshed on-the-go listening experience, plus an exclusive
                  members area with various benefits.
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

export const preview = (reminder: boolean) =>
  reminder
    ? "You're signed up — don't forget to confirm your account."
    : "Thank you for becoming a supporter — confirm your account and activate your subscription.";

export default WelcomeCompletePaymentEmail;

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

const seperator = {
  borderTop: "#000 solid 1px",
  margin: "24px 0",
};
