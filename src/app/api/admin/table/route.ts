import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { getTenantFromSession } from "#utils/database/tenantHelper";
import { authOptions } from "#utils/helper/authHelper";
import { CatchNextResponse } from "#utils/helper/common";

export async function PUT(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) throw { status: 401, message: "Authentication Required" };
		if (session.role === "platform_admin") throw { status: 403, message: "Not a restaurant session" };

		const { count } = await req.json();
		if (typeof count !== "number" || count < 0 || count > 100) throw { status: 400, message: "Table count must be 0-100" };

		const { Tables, Accounts } = await getTenantFromSession(session);
		const restaurantID = session.username;

		const existing = await Tables.find({ restaurantID }).sort({ username: 1 });
		const currentCount = existing.length;

		if (count > currentCount) {
			// Add tables
			const newTables = [];
			for (let i = currentCount + 1; i <= count; i++) {
				const table = await new Tables({
					name: `Table ${i}`,
					username: String(i),
					restaurantID,
				}).save();
				newTables.push(table._id);
			}
			if (newTables.length) {
				await Accounts.updateOne({ username: restaurantID }, { $addToSet: { tables: { $each: newTables } } });
			}
		} else if (count < currentCount) {
			// Remove tables from the end
			const toRemove = existing.slice(count);
			const removeIds = toRemove.map((t) => t._id);
			await Tables.deleteMany({ _id: { $in: removeIds } });
			await Accounts.updateOne({ username: restaurantID }, { $pull: { tables: { $in: removeIds } } });
		}

		const tables = await Tables.find({ restaurantID }).sort({ username: 1 }).lean();
		return NextResponse.json(tables);
	} catch (err) {
		console.log(err);
		return CatchNextResponse(err);
	}
}

export const dynamic = "force-dynamic";
