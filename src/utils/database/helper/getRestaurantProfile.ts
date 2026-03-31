import connectPlatformDB from "#utils/database/connect";
import { Clients } from "#utils/database/models/platform/client";
import { getTenantModels } from "#utils/database/models/tenant";
import type { TProfile } from "#utils/database/schemas/profileSchema";
import { getTenantConnection } from "#utils/database/tenantConnect";

const SEO_FIELDS = "name restaurantID description address avatar cover categories themeColor" as const;

export async function getRestaurantProfile(restaurantID: string) {
	await connectPlatformDB();
	const client = await Clients.findOne({ slug: restaurantID.toLowerCase() });
	if (!client) return null;

	const conn = await getTenantConnection(client.databaseName);
	const models = getTenantModels(conn);
	return models.Profiles.findOne<TProfile>({ restaurantID }).select(SEO_FIELDS).lean();
}
