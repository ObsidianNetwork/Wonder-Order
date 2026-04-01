import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import type { TMenu } from "#utils/database/models/menu";
import type { TOrder, TProduct } from "#utils/database/models/order";
import { getTenantFromSession } from "#utils/database/tenantHelper";
import { authOptions } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";
import { stripe } from "#utils/stripe/stripe";

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) throw { status: 401, message: "Authentication Required" };

		const body = await req.json();
		const { paymentIntentId, products: cartProducts } = body;

		if (!paymentIntentId) throw { status: 400, message: "Payment intent ID required" };
		if (!cartProducts?.length) throw { status: 400, message: "Cart is empty" };

		// Verify payment succeeded on Stripe's side
		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
		if (paymentIntent.status !== "succeeded") {
			throw { status: 400, message: "Payment has not been completed" };
		}

		// Verify the payment belongs to this restaurant/customer
		if (paymentIntent.metadata.restaurantID !== session.restaurant?.username) {
			throw { status: 403, message: "Payment does not match this session" };
		}

		const { Menus, Orders, Profiles } = await getTenantFromSession(session);

		// Check for duplicate — don't create the order twice
		// biome-ignore lint/suspicious/noExplicitAny: Mongoose filter type
		const existing = await Orders.findOne({ paymentIntentId } as any);
		if (existing) {
			return NextResponse.json({ status: 200, message: "Order already created" });
		}

		const profile = await Profiles.findOne({ restaurantID: session?.restaurant?.username });
		const autoAccept = profile?.autoAcceptOrders ?? false;

		const products: TProduct[] = await Promise.all(
			cartProducts.map(async (item: { _id: string; quantity: number }) => {
				const menuItem = await Menus.findById<TMenu>(item._id).lean();
				if (!menuItem) throw { status: 404, message: "Ordered product(s) not found" };

				return {
					product: item._id,
					quantity: item.quantity,
					price: menuItem.price,
					tax: ((menuItem.price * menuItem.taxPercent) / 100).toFixed(2),
					adminApproved: autoAccept,
				};
			}),
		);

		const newOrder = new Orders({
			restaurantID: session.restaurant?.username,
			table: session.restaurant?.table,
			customer: session.customer?._id,
			products,
			paymentIntentId,
			paymentStatus: "paid",
			amountPaid: paymentIntent.amount,
		});
		await newOrder.save();

		return NextResponse.json({ status: 200, message: "Order placed successfully" });
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
