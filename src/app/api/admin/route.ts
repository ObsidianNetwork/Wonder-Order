import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import type { TAccount } from "#utils/database/models/account";
import { getTenantFromSession } from "#utils/database/tenantHelper";
import { authOptions } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session) throw { status: 401, message: "Authentication Required" };
		if (session.role === "platform_admin") return NextResponse.json({ profile: null, menus: [], tables: [] });

		const { Accounts } = await getTenantFromSession(session);
		const account = await Accounts.findOne<TAccount>({ username: session?.username }).populate("profile").populate("tables").populate("menus").lean();

		if (!account) throw { status: 500, message: "Unable to fetch data" };

		return NextResponse.json({
			profile: account.profile,
			menus: account.menus,
			tables: account.tables,
		});
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
