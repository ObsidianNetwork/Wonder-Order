import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import type { TOrder } from "#utils/database/models/order";
import { getTenantFromSession } from "#utils/database/tenantHelper";
import { authOptions } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function POST() {
	try {
		const session = await getServerSession(authOptions);

		if (!session) throw { status: 401, message: "Authentication Required" };

		const { Orders } = await getTenantFromSession(session);
		const restaurantID = session?.restaurant?.username;
		const customer = session?.customer?._id;
		// biome-ignore lint/suspicious/noExplicitAny: Mongoose filter type mismatch with ObjectId
		const order = (await Orders.findOne({ restaurantID, customer, state: "active" } as any)) as TOrder | null;

		if (!order) throw { status: 400, message: "No active orders found" };

		order.state = "cancel";

		await order.save();

		return NextResponse.json({ status: 200, message: "Order canceled." });
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
