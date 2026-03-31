import pick from "lodash/pick";
import { NextResponse } from "next/server";

import connectPlatformDB from "#utils/database/connect";
import type { TAccount } from "#utils/database/models/account";
import { Clients } from "#utils/database/models/platform/client";
import { getTenantModels } from "#utils/database/models/tenant";
import { getTenantConnection } from "#utils/database/tenantConnect";
import { CatchNextResponse } from "#utils/helper/common";

export async function GET(req: Request) {
	try {
		const email = new URL(req.url).searchParams.get("email");
		if (!email) throw { status: 400, message: "Email is required" };

		await connectPlatformDB();

		// Search across all active clients for this email
		const clients = await Clients.find({ status: { $in: ["active", "trial"] } });
		for (const client of clients) {
			const conn = await getTenantConnection(client.databaseName);
			const models = getTenantModels(conn);
			const account = await models.Accounts.findOne<TAccount>({ email }).populate("profile");
			if (account) {
				return NextResponse.json(pick(account?.profile, ["name", "address", "themeColor", "avatar"]));
			}
		}

		throw { status: 404, message: "Account not found" };
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
