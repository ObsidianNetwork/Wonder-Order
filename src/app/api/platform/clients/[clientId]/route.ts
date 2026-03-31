import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectPlatformDB from "#utils/database/connect";
import { Clients } from "#utils/database/models/platform/client";
import { ClientThemes } from "#utils/database/models/platform/clientTheme";
import { FeatureFlags } from "#utils/database/models/platform/featureFlags";
import { authOptions } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function GET(_req: Request, { params }: { params: Promise<{ clientId: string }> }) {
	try {
		const session = await getServerSession(authOptions);
		if (!session || session.role !== "platform_admin") throw { status: 403, message: "Platform admin access required" };

		const { clientId } = await params;
		await connectPlatformDB();

		const client = await Clients.findOne({ clientId }).lean();
		if (!client) throw { status: 404, message: "Client not found" };

		const [theme, features] = await Promise.all([ClientThemes.findOne({ clientId }).lean(), FeatureFlags.findOne({ clientId }).lean()]);

		return NextResponse.json({ ...client, theme, features });
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export async function PATCH(req: Request, { params }: { params: Promise<{ clientId: string }> }) {
	try {
		const session = await getServerSession(authOptions);
		if (!session || session.role !== "platform_admin") throw { status: 403, message: "Platform admin access required" };

		const { clientId } = await params;
		const body = await req.json();
		await connectPlatformDB();

		const allowedFields = ["name", "email", "abn", "status"];
		const update: Record<string, unknown> = {};
		for (const field of allowedFields) {
			if (body[field] !== undefined) update[field] = body[field];
		}

		const client = await Clients.findOneAndUpdate({ clientId }, update, { new: true });
		if (!client) throw { status: 404, message: "Client not found" };

		return NextResponse.json(client);
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ clientId: string }> }) {
	try {
		const session = await getServerSession(authOptions);
		if (!session || session.role !== "platform_admin") throw { status: 403, message: "Platform admin access required" };

		const { clientId } = await params;
		await connectPlatformDB();

		const client = await Clients.findOne({ clientId });
		if (!client) throw { status: 404, message: "Client not found" };

		// Remove platform records
		await Promise.all([Clients.deleteOne({ clientId }), ClientThemes.deleteOne({ clientId }), FeatureFlags.deleteOne({ clientId })]);

		// Drop the tenant database
		const { getTenantConnection } = await import("#utils/database/tenantConnect");
		try {
			const conn = await getTenantConnection(client.databaseName);
			await conn.dropDatabase();
			await conn.close();
		} catch {
			// DB may not exist yet, that's fine
		}

		return NextResponse.json({ message: "Client deleted" });
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
