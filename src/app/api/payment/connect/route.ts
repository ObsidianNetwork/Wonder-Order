import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectPlatformDB from "#utils/database/connect";
import { Clients } from "#utils/database/models/platform/client";
import { authOptions } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";
import { stripe } from "#utils/stripe/stripe";

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) throw { status: 401, message: "Authentication Required" };

		// Restaurant admin connects their own account
		if (session.role !== "admin") {
			throw { status: 403, message: "Restaurant admin access required" };
		}

		await connectPlatformDB();
		const client = await Clients.findOne({ slug: session.username });
		if (!client) throw { status: 404, message: "Restaurant not found" };

		let accountId = client.stripeAccountId;

		// Create a Stripe Connect Express account if one doesn't exist
		if (!accountId) {
			const account = await stripe.accounts.create({
				type: "express",
				country: "AU",
				email: client.email,
				capabilities: {
					card_payments: { requested: true },
					transfers: { requested: true },
				},
				business_profile: {
					name: client.name,
				},
			});
			accountId = account.id;
			client.stripeAccountId = accountId;
			await client.save();
		}

		// Create an onboarding link that returns to their dashboard
		const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
		const accountLink = await stripe.accountLinks.create({
			account: accountId,
			refresh_url: `${siteUrl}/dashboard?tab=settings`,
			return_url: `${siteUrl}/dashboard?tab=settings&stripe=connected`,
			type: "account_onboarding",
		});

		return NextResponse.json({ url: accountLink.url });
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
