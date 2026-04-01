import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import type { TMenu } from "#utils/database/models/menu";
import connectPlatformDB from "#utils/database/connect";
import { Clients } from "#utils/database/models/platform/client";
import { getTenantFromSession } from "#utils/database/tenantHelper";
import { authOptions } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";
import { PLATFORM_FEE_PERCENT, stripe } from "#utils/stripe/stripe";

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) throw { status: 401, message: "Authentication Required" };

		const body = await req.json();
		if (!body?.products?.length) throw { status: 400, message: "Cart is empty" };

		const { Menus, Profiles } = await getTenantFromSession(session);

		const profile = await Profiles.findOne({ restaurantID: session?.restaurant?.username });
		if (!profile || profile.paymentMode !== "pay_first") {
			throw { status: 400, message: "Online payment is not enabled for this restaurant" };
		}

		// Look up the client's Stripe account
		await connectPlatformDB();
		const client = await Clients.findOne({ slug: session?.restaurant?.username });
		if (!client?.stripeAccountId || !client?.stripeOnboarded) {
			throw { status: 400, message: "Restaurant has not set up payments" };
		}

		// Calculate order total from DB prices (never trust client prices)
		let subtotal = 0;
		let taxTotal = 0;
		for (const item of body.products) {
			const menuItem = await Menus.findById<TMenu>(item._id).lean();
			if (!menuItem) throw { status: 404, message: "Menu item not found" };

			const quantity = Math.max(1, Math.round(item.quantity));
			const itemTotal = menuItem.price * quantity;
			const itemTax = (menuItem.price * menuItem.taxPercent) / 100 * quantity;
			subtotal += itemTotal;
			taxTotal += itemTax;
		}

		const totalCents = Math.round((subtotal + taxTotal) * 100);
		const feeCents = Math.round(totalCents * (PLATFORM_FEE_PERCENT / 100));

		const paymentIntent = await stripe.paymentIntents.create({
			amount: totalCents,
			currency: "aud",
			application_fee_amount: feeCents,
			transfer_data: { destination: client.stripeAccountId },
			metadata: {
				restaurantID: session.restaurant?.username ?? "",
				table: session.restaurant?.table ?? "",
				customerId: String(session.customer?._id ?? ""),
			},
		});

		return NextResponse.json({
			clientSecret: paymentIntent.client_secret,
			paymentIntentId: paymentIntent.id,
			amount: totalCents,
		});
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
