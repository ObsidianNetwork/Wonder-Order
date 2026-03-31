import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectPlatformDB from "#utils/database/connect";
import { FeatureFlags } from "#utils/database/models/platform/featureFlags";
import { authOptions } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function GET(_req: Request, { params }: { params: Promise<{ clientId: string }> }) {
	try {
		const session = await getServerSession(authOptions);
		if (!session || session.role !== "platform_admin") throw { status: 403, message: "Platform admin access required" };

		const { clientId } = await params;
		await connectPlatformDB();

		const flags = await FeatureFlags.findOne({ clientId }).lean();
		if (!flags) throw { status: 404, message: "Feature flags not found" };

		return NextResponse.json(flags);
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

		const allowedFields = ["aiChat", "qrScanning", "kitchenDashboard", "onlinePayment", "orderHistory"];
		const update: Record<string, unknown> = {};
		for (const field of allowedFields) {
			if (body[field] !== undefined) update[field] = body[field];
		}

		const flags = await FeatureFlags.findOneAndUpdate({ clientId }, update, { new: true });
		if (!flags) throw { status: 404, message: "Feature flags not found" };

		return NextResponse.json(flags);
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
