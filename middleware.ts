import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const response = NextResponse.next();
    const country = request.headers.get("x-vercel-ip-country") || "";
    response.cookies.set("country", country, {
        httpOnly: false,
        path: "/",
        sameSite: "lax",
        maxAge: 86400,
    });
    return response;
}
