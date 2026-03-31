import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
	const { pathname } = req.nextUrl;
	const segments = pathname.split("/").filter(Boolean);
	const firstSegment = segments[0]?.toLowerCase();

	// Protect /platform routes - require platform_admin role
	if (firstSegment === "platform" && !pathname.startsWith("/platform/login")) {
		const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
		if (!token?.user || token.user.role !== "platform_admin") {
			return NextResponse.redirect(new URL("/platform/login", req.url));
		}
	}

	// Protect /dashboard routes - require admin or kitchen role with clientId
	if (firstSegment === "dashboard" || firstSegment === "kitchen") {
		const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
		if (!token?.user) {
			return NextResponse.redirect(new URL("/", req.url));
		}
	}

	// For potential restaurant slug routes, pass through
	// The actual tenant resolution happens in API routes and layouts via getTenantFromSlug()
	// Middleware just ensures basic route protection

	return NextResponse.next();
}

export const config = {
	matcher: ["/platform/:path*", "/dashboard/:path*", "/kitchen/:path*"],
};
