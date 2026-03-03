import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  // Admin page and API routes are protected by Contentful OAuth (useContentfulAuth)
  matcher: [],
};
