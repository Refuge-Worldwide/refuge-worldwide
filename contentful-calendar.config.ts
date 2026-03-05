import {
  defineCalendarConfig,
  refugeDefaultConfig,
} from "@refuge-worldwide/calendar";

const devManagementToken = process.env.NEXT_PUBLIC_CONTENTFUL_MANAGEMENT_TOKEN;

export default defineCalendarConfig({
  contentful: {
    spaceId: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!,
    environmentId: process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT_ID!,
    accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN!,
    previewToken: process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN!,
    managementToken: devManagementToken,
  },
  // When NEXT_PUBLIC_CONTENTFUL_MANAGEMENT_TOKEN is set in .env.local, skip
  // OAuth entirely — useful for local dev without needing ngrok.
  auth: devManagementToken
    ? undefined
    : {
        contentfulOAuth: {
          clientId: process.env.NEXT_PUBLIC_CONTENTFUL_OAUTH_CLIENT_ID!,
          // redirectUri omitted — defaults to window.location at runtime,
          // so it works on localhost, ngrok, staging and production automatically
        },
      },
  onShowConfirmed: async (show) => {
    await fetch("/api/admin/confirmation-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(show),
    });
  },
  ...refugeDefaultConfig,
  contentfulAppUrl: `https://app.contentful.com/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}`,
});
