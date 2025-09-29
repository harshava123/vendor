// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // In dummy mode we only check token presence and skip verification
  return NextResponse.next();
}

export const config = {
  matcher: ["/home"],
};
