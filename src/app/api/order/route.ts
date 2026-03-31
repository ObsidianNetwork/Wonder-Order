import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import type { TCustomer } from "#utils/database/models/customer";
import type { TMenu } from "#utils/database/models/menu";
import type { TOrder, TProduct } from "#utils/database/models/order";
import { getTenantFromSession } from "#utils/database/tenantHelper";
import { authOptions } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);

		if (!session) throw { status: 401, message: "Authentication Required" };

		const { Orders } = await getTenantFromSession(session);
		const restaurantID = session?.restaurant?.username;
		const customer = session?.customer?._id;
		// biome-ignore lint/suspicious/noExplicitAny: Mongoose filter type mismatch with ObjectId
		const order = (await Orders.findOne({ restaurantID, customer, state: "active" } as any)
			.populate<{ customer: TCustomer }>("customer")
			.populate<{ products: { product: TMenu }[] }>("products.product")
			.lean()) as unknown as TOrder | null;

		let formattedOrder: unknown = order;

		if (order?.products) {
			const products = order.products.map((p) => {
				const product = p as unknown as TProduct;
				const menu = product.product as unknown as TMenu;
				return {
					...product,
					...menu,
					product: menu?._id,
				};
			});
			formattedOrder = { ...order, products: products as unknown as TProduct[] };
		}

		return NextResponse.json(formattedOrder);
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
