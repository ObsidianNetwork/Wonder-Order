import { NextResponse } from "next/server";

import connectPlatformDB from "#utils/database/connect";
import { PlatformAdmins } from "#utils/database/models/platform/platformAdmin";
import { CatchNextResponse } from "#utils/helper/common";

export async function POST(req: Request) {
	try {
		await connectPlatformDB();

		// Only allow seeding if no platform admins exist
		const existing = await PlatformAdmins.countDocuments();
		if (existing > 0) {
			return NextResponse.json({ message: "Platform admin already exists. Seed blocked." }, { status: 409 });
		}

		const { email, password, name } = await req.json();
		if (!email || !password || !name) {
			return NextResponse.json({ message: "email, password, and name are required" }, { status: 400 });
		}

		const admin = await new PlatformAdmins({
			email: email.toLowerCase(),
			password,
			name,
		}).save();

		return NextResponse.json(
			{
				message: "Platform admin created",
				email: admin.email,
				name: admin.name,
			},
			{ status: 201 },
		);
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
