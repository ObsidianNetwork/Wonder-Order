import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import type { TMenu } from "#utils/database/models/menu";
import { getTenantFromSession } from "#utils/database/tenantHelper";
import { authOptions } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) throw { status: 401, message: "Authentication Required" };
		if (session.role === "platform_admin") throw { status: 403, message: "Not a restaurant session" };

		const body = await req.json();
		if (!body?.name) throw { status: 400, message: "Item name is required" };
		if (!body?.price && body?.price !== 0) throw { status: 400, message: "Price is required" };
		if (!body?.veg) throw { status: 400, message: "Veg/Non-veg is required" };
		if (body?.taxPercent === undefined) throw { status: 400, message: "Tax percent is required" };

		const { Menus, Accounts, Profiles } = await getTenantFromSession(session);

		// Validate category exists
		if (body.category) {
			const profile = await Profiles.findOne({ restaurantID: session.username });
			if (!profile?.categories?.includes(body.category.toLowerCase())) {
				throw { status: 400, message: `Category '${body.category}' does not exist` };
			}
		}

		const menuItem = await new Menus({
			name: body.name,
			restaurantID: session.username,
			description: body.description || "",
			category: body.category?.toLowerCase() || "",
			price: body.price,
			taxPercent: body.taxPercent,
			foodType: body.foodType || undefined,
			veg: body.veg,
			image: body.image || "",
			hidden: body.hidden ?? true,
		}).save();

		await Accounts.updateOne({ username: session.username }, { $addToSet: { menus: menuItem._id } });

		return NextResponse.json(menuItem, { status: 201 });
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export async function PATCH(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) throw { status: 401, message: "Authentication Required" };
		if (session.role === "platform_admin") throw { status: 403, message: "Not a restaurant session" };

		const body = await req.json();
		if (!body?.itemId) throw { status: 400, message: "Item ID is required" };

		const { Menus } = await getTenantFromSession(session);
		const menuItem = await Menus.findById<TMenu>(body.itemId);
		if (!menuItem) throw { status: 404, message: "Menu item not found" };

		const allowedFields = ["name", "description", "category", "price", "taxPercent", "foodType", "veg", "image", "hidden"];
		for (const field of allowedFields) {
			if (body[field] !== undefined) {
				(menuItem as unknown as Record<string, unknown>)[field] = body[field];
			}
		}

		await menuItem.save();
		return NextResponse.json(menuItem);
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export async function DELETE(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) throw { status: 401, message: "Authentication Required" };
		if (session.role === "platform_admin") throw { status: 403, message: "Not a restaurant session" };

		const body = await req.json();
		if (!body?.itemId) throw { status: 400, message: "Item ID is required" };

		const { Menus, Accounts } = await getTenantFromSession(session);

		const result = await Menus.findByIdAndDelete(body.itemId);
		if (!result) throw { status: 404, message: "Menu item not found" };

		await Accounts.updateOne({ username: session.username }, { $pull: { menus: body.itemId } });

		return NextResponse.json({ message: "Menu item deleted" });
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
