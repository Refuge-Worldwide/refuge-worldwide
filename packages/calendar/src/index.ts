// Config
export {
  defineCalendarConfig,
  refugeDefaultConfig,
  type CalendarConfig,
  type CalendarContentfulConfig,
  type ContentfulOAuthConfig,
  type ShowFieldMap,
  type ArtistFieldMap,
  type StatusValueMap,
  type TypeValueMap,
  type StatusColorMap,
  type CalendarEmailConfig,
  type EmailAdapter,
  type ConfirmationEmailData,
  type ReminderConfig,
} from "./config";

// Auth — Contentful OAuth hook and utilities
export { useContentfulAuth, type AuthState } from "./hooks/useContentfulAuth";
export {
  buildAuthUrl,
  redirectToContentfulAuth,
  parseCallbackHash,
  storeToken,
  getStoredToken,
  clearStoredToken,
  getTokenTTL,
} from "./lib/oauth";

// Types
export {
  type CalendarShow,
  type CalendarArtist,
  type RawCalendarShow,
  type DropdownOption,
  type ShowFormValues,
  type MutationResult,
} from "./types";

// Mutation helpers — these run client-side with the management client
export {
  createCalendarShow,
  updateCalendarShow,
  deleteCalendarShow,
  createArtist,
  updateArtistEmail,
  type ManagementClient,
} from "./lib/mutations";

// Query helpers — used by API handlers but also exportable for custom use
export {
  buildCalendarQuery,
  buildSearchQuery,
  buildArtistSearchQuery,
  executeGraphQL,
  extractItems,
  processShow,
} from "./lib/queries";
