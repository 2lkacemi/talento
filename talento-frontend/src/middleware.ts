import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

// Empty matcher — middleware runs for no routes
export const config = {
  matcher: [],
};
