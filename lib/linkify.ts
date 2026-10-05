// Same logic lives in refugeWorldwideApp's lib/linkify.ts - keep both in sync
// by hand rather than pulling in a linkify library for something this small.
const URL_SPLIT_PATTERN = /(https?:\/\/[^\s]+)/g;
const URL_MATCH_PATTERN = /^https?:\/\/[^\s]+$/;

export function splitOnUrls(text: string): string[] {
  return text.split(URL_SPLIT_PATTERN);
}

export function isUrl(part: string): boolean {
  return URL_MATCH_PATTERN.test(part);
}
