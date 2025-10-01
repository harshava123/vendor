// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Accept either cookie token or localStorage-based auth handled client-side
  const token = req.cookies.get("token")?.value;
  if (!token) {
    // Allow public pages and client-side guard to manage redirects
    return NextResponse.next();
  }
  return NextResponse.next();
}

export const config = {
  // Currently disabled strict protection to avoid unwanted redirects
  matcher: [],
};
