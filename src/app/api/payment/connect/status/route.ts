import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectPlatformDB from "#utils/database/connect";
import { Clients } from "#utils/database/models/platform/client";
import { authOptions } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";
import { stripe } from "#utils/stripe/stripe";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session) throw { status: 401, message: "Authentication Required" };
		if (session.role !== "admin") throw { status: 403, message: "Restaurant admin access required" };

		await connectPlatformDB();
		const client = await Clients.findOne({ slug: session.username });
		if (!client) throw { status: 404, message: "Restaurant not found" };

		if (!client.stripeAccountId) {
			return NextResponse.json({ connected: false, onboarded: false });
		}

		const account = await stripe.accounts.retrieve(client.stripeAccountId);
		const onboarded = !!(account.charges_enabled && account.payouts_enabled);

		if (client.stripeOnboarded !== onboarded) {
			client.stripeOnboarded = onboarded;
			await client.save();
		}

		return NextResponse.json({ connected: true, onboarded });
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
