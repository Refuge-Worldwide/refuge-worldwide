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
  supportersUrl = "https://refugeworldwide.com/supporters",
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
                    ? "Just a nudge — you're almost there! You still need to complete your account setup and payment at the link below. Thank you for keeping independent radio alive."
                    : "You're almost there! Just complete your account setup and payment at the link below. Thank you for keeping independent radio alive."}
                </Text>
                <Button href={supportersUrl} style={button} pY={9} pX={12}>
                  COMPLETE ACCOUNT SETUP
                </Button>
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

export const preview = (reminder: boolean) =>
  reminder
    ? "You're signed up — don't forget to complete your account setup."
    : "Welcome to Refuge Worldwide — complete your account setup.";

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
