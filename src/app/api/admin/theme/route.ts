import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { isValidThemeColor } from "xtreme-ui";

import type { TProfile } from "#utils/database/models/profile";
import { getTenantFromSession } from "#utils/database/tenantHelper";
import { authOptions } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		const { themeColor } = await req.json();

		if (!session) throw { status: 401, message: "Authentication Required" };
		if (session.role === "platform_admin") throw { status: 403, message: "Not a restaurant session" };
		if (!isValidThemeColor(themeColor)) throw { status: 400, message: "Valid theme color is required" };

		const { Profiles } = await getTenantFromSession(session);
		const profile = await Profiles.findOne<TProfile>({ restaurantID: session?.username });

		if (!profile) throw { status: 500, message: "Something went wrong" };

		profile.themeColor = themeColor;
		await profile.save();

		return NextResponse.json({ status: 200, message: "Theme applied successfully" });
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
