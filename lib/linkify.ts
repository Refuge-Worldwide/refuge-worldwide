// Same logic lives in refugeWorldwideApp's lib/linkify.ts - keep both in sync
import anchorme from "anchorme";

export type TextPart = { text: string; href?: string };

type Match = ReturnType<typeof anchorme.list>[number];

// only web links and emails - anchorme also finds file://, ftp:// and raw IPs
function toHref(match: Match): string | null {
  if (match.isEmail) return `mailto:${match.string}`;
  if (!match.isURL || match.ipv4) return null;
  if (!match.protocol) return `https://${match.string}`;
  return /^https?:\/\//i.test(match.protocol) ? match.string : null;
}

export function linkify(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let last = 0;
  // chat is plain text, so don't let anchorme skip things that look like HTML
  for (const match of anchorme.list(text, false)) {
    const href = toHref(match);
    if (!href) continue;
    if (match.start > last) parts.push({ text: text.slice(last, match.start) });
    parts.push({ text: match.string, href });
    last = match.end;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}
