import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectPlatformDB from "#utils/database/connect";
import { Clients } from "#utils/database/models/platform/client";
import { ClientThemes } from "#utils/database/models/platform/clientTheme";
import { getNextClientId } from "#utils/database/models/platform/counter";
import { FeatureFlags } from "#utils/database/models/platform/featureFlags";
import { getTenantModels } from "#utils/database/models/tenant";
import { getTenantConnection } from "#utils/database/tenantConnect";
import { authOptions } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session || session.role !== "platform_admin") throw { status: 403, message: "Platform admin access required" };

		await connectPlatformDB();
		const clients = await Clients.find().sort({ createdAt: -1 }).lean();

		return NextResponse.json(clients);
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session || session.role !== "platform_admin") throw { status: 403, message: "Platform admin access required" };

		const body = await req.json();
		const { name, abn, slug, email, adminPassword } = body;

		if (!name) throw { status: 400, message: "Business name is required" };
		if (!slug) throw { status: 400, message: "URL slug is required" };
		if (!email) throw { status: 400, message: "Admin email is required" };
		if (!adminPassword) throw { status: 400, message: "Admin password is required" };
		if (abn && !/^\d{11}$/.test(abn)) throw { status: 400, message: "ABN must be 11 digits" };

		await connectPlatformDB();

		// Check slug uniqueness
		const existing = await Clients.findOne({ slug: slug.toLowerCase() });
		if (existing) throw { status: 409, message: "URL slug already in use" };

		if (abn) {
			const existingABN = await Clients.findOne({ abn });
			if (existingABN) throw { status: 409, message: "ABN already registered" };
		}

		// Generate client ID
		const clientId = await getNextClientId();
		const databaseName = `wonder_${clientId.replace("-", "")}`;

		// Create client record in platform DB
		const client = await new Clients({
			clientId,
			abn: abn || undefined,
			slug: slug.toLowerCase(),
			name,
			email: email.toLowerCase(),
			status: "trial",
			databaseName,
		}).save();

		// Create default theme and feature flags
		await Promise.all([new ClientThemes({ clientId }).save(), new FeatureFlags({ clientId }).save()]);

		// Provision tenant database
		const conn = await getTenantConnection(databaseName);
		const models = getTenantModels(conn);

		// Create admin account in tenant DB
		const account = await new models.Accounts({
			username: slug.toLowerCase(),
			email: email.toLowerCase(),
			password: adminPassword,
		}).save();

		// Create profile in tenant DB and link to account
		const profile = await new models.Profiles({
			name,
			restaurantID: slug.toLowerCase(),
		}).save();

		await models.Accounts.updateOne({ _id: account._id }, { $set: { profile: profile._id } });

		return NextResponse.json(
			{
				clientId: client.clientId,
				slug: client.slug,
				databaseName: client.databaseName,
				status: client.status,
				adminAccountId: account._id,
			},
			{ status: 201 },
		);
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
