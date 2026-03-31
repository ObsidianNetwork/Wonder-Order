import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectPlatformDB from "#utils/database/connect";
import { Clients } from "#utils/database/models/platform/client";
import { getTenantModels } from "#utils/database/models/tenant";
import { getTenantConnection } from "#utils/database/tenantConnect";
import { authOptions } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function POST(req: Request, { params }: { params: Promise<{ clientId: string }> }) {
	try {
		const session = await getServerSession(authOptions);
		if (!session || session.role !== "platform_admin") throw { status: 403, message: "Platform admin access required" };

		const { clientId } = await params;
		const { newPassword } = await req.json();

		if (!newPassword) throw { status: 400, message: "New password is required" };
		if (newPassword.length < 6) throw { status: 400, message: "Password must be at least 6 characters" };

		await connectPlatformDB();
		const client = await Clients.findOne({ clientId });
		if (!client) throw { status: 404, message: "Client not found" };

		const conn = await getTenantConnection(client.databaseName);
		const models = getTenantModels(conn);

		const account = await models.Accounts.findOne({ username: client.slug });
		if (!account) throw { status: 404, message: "Client admin account not found" };

		account.password = newPassword;
		await account.save();

		return NextResponse.json({ message: "Password reset successfully" });
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
