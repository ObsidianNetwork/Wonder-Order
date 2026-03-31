import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { getTenantFromSession } from "#utils/database/tenantHelper";
import { authOptions } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function PATCH(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) throw { status: 401, message: "Authentication Required" };
		if (session.role === "platform_admin") throw { status: 403, message: "Not a restaurant session" };

		const body = await req.json();
		const { Profiles } = await getTenantFromSession(session);

		const profile = await Profiles.findOne({ restaurantID: session.username });
		if (!profile) throw { status: 404, message: "Profile not found" };

		const allowedFields = ["name", "description", "address", "avatar", "cover", "gstInclusive"];
		for (const field of allowedFields) {
			if (body[field] !== undefined) {
				(profile as unknown as Record<string, unknown>)[field] = body[field];
			}
		}

		await profile.save();
		return NextResponse.json(profile);
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
