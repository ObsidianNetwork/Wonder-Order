import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { getTenantFromSession } from "#utils/database/tenantHelper";
import { authOptions } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) throw { status: 401, message: "Authentication Required" };
		if (session.role === "platform_admin") throw { status: 403, message: "Not a restaurant session" };

		const { category } = await req.json();
		if (!category) throw { status: 400, message: "Category name is required" };

		const { Profiles } = await getTenantFromSession(session);
		const profile = await Profiles.findOne({ restaurantID: session.username });
		if (!profile) throw { status: 404, message: "Profile not found" };

		const normalized = category.toLowerCase().trim();
		if (profile.categories.includes(normalized)) {
			throw { status: 409, message: "Category already exists" };
		}

		profile.categories.push(normalized);
		await profile.save();

		return NextResponse.json({ categories: profile.categories }, { status: 201 });
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export async function DELETE(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) throw { status: 401, message: "Authentication Required" };
		if (session.role === "platform_admin") throw { status: 403, message: "Not a restaurant session" };

		const { category } = await req.json();
		if (!category) throw { status: 400, message: "Category name is required" };

		const { Profiles } = await getTenantFromSession(session);
		const profile = await Profiles.findOne({ restaurantID: session.username });
		if (!profile) throw { status: 404, message: "Profile not found" };

		profile.categories = profile.categories.filter((c: string) => c !== category.toLowerCase());
		await profile.save();

		return NextResponse.json({ categories: profile.categories });
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
