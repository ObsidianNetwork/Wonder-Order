import connectPlatformDB from "#utils/database/connect";
import type { TAccount } from "#utils/database/models/account";
import { Clients } from "#utils/database/models/platform/client";
import { getTenantModels } from "#utils/database/models/tenant";
import { getTenantConnection } from "#utils/database/tenantConnect";

export async function getRestaurantData(username: string) {
	await connectPlatformDB();

	// Look up client by slug
	const client = await Clients.findOne({ slug: username.toLowerCase() });
	if (!client) return null;

	const conn = await getTenantConnection(client.databaseName);
	const models = getTenantModels(conn);

	return await models.Accounts.findOne<TAccount>({ username }).populate("profile").populate("tables").populate("menus").lean();
}
