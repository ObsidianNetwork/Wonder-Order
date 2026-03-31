import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectPlatformDB from "#utils/database/connect";
import { ClientThemes } from "#utils/database/models/platform/clientTheme";
import { authOptions } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function GET(_req: Request, { params }: { params: Promise<{ clientId: string }> }) {
	try {
		const session = await getServerSession(authOptions);
		if (!session || session.role !== "platform_admin") throw { status: 403, message: "Platform admin access required" };

		const { clientId } = await params;
		await connectPlatformDB();

		const theme = await ClientThemes.findOne({ clientId }).lean();
		if (!theme) throw { status: 404, message: "Theme not found" };

		return NextResponse.json(theme);
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export async function PUT(req: Request, { params }: { params: Promise<{ clientId: string }> }) {
	try {
		const session = await getServerSession(authOptions);
		if (!session || session.role !== "platform_admin") throw { status: 403, message: "Platform admin access required" };

		const { clientId } = await params;
		const body = await req.json();
		await connectPlatformDB();

		const theme = await ClientThemes.findOneAndUpdate({ clientId }, body, { new: true, upsert: true });

		return NextResponse.json(theme);
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
