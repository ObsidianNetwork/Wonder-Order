import { NextResponse } from "next/server";
import { stripe } from "#utils/stripe/stripe";
import connectPlatformDB from "#utils/database/connect";
import { Clients } from "#utils/database/models/platform/client";
import { getTenantModels } from "#utils/database/models/tenant";
import { getTenantConnection } from "#utils/database/tenantConnect";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
	if (!webhookSecret) {
		return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
	}

	const body = await req.text();
	const sig = req.headers.get("stripe-signature");
	if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

	let event;
	try {
		event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
	} catch (err) {
		console.log("Webhook signature verification failed:", err);
		return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
	}

	try {
		switch (event.type) {
			case "payment_intent.succeeded": {
				const pi = event.data.object;
				const { restaurantID } = pi.metadata;
				if (!restaurantID) break;

				await connectPlatformDB();
				const client = await Clients.findOne({ slug: restaurantID });
				if (!client) break;

				const conn = await getTenantConnection(client.databaseName);
				const { Orders } = getTenantModels(conn);

				// Update payment status if order exists (belt-and-suspenders)
				await Orders.updateOne(
					{ paymentIntentId: pi.id },
					{ $set: { paymentStatus: "paid", amountPaid: pi.amount } },
				);
				break;
			}

			case "payment_intent.payment_failed": {
				const pi = event.data.object;
				const { restaurantID } = pi.metadata;
				if (!restaurantID) break;

				await connectPlatformDB();
				const client = await Clients.findOne({ slug: restaurantID });
				if (!client) break;

				const conn = await getTenantConnection(client.databaseName);
				const { Orders } = getTenantModels(conn);

				await Orders.updateOne(
					{ paymentIntentId: pi.id },
					{ $set: { paymentStatus: "failed" } },
				);
				break;
			}

			case "account.updated": {
				const account = event.data.object;
				await connectPlatformDB();
				await Clients.updateOne(
					{ stripeAccountId: account.id },
					{ $set: { stripeOnboarded: account.charges_enabled && account.payouts_enabled } },
				);
				break;
			}
		}
	} catch (err) {
		console.log("Webhook handler error:", err);
	}

	return NextResponse.json({ received: true });
}

export const dynamic = "force-dynamic";
