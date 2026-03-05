import {
  defineCalendarConfig,
  refugeDefaultConfig,
} from "@refuge-worldwide/calendar";

export default defineCalendarConfig({
  contentful: {
    spaceId: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!,
    environmentId: process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT_ID!,
    accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN!,
    previewToken: process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN!,
  },
  auth: {
    contentfulOAuth: {
      clientId: process.env.NEXT_PUBLIC_CONTENTFUL_OAUTH_CLIENT_ID!,
      // redirectUri omitted — defaults to window.location at runtime,
      // so it works on localhost, ngrok, staging and production automatically
    },
  },
  ...refugeDefaultConfig,
  contentfulAppUrl: `https://app.contentful.com/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}`,
});
