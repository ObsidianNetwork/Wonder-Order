import { getServerSession } from "next-auth";

import { authOptions } from "#utils/helper/authHelper";
import connectPlatformDB from "../connect";
import { Clients } from "../models/platform/client";
import { getTenantModels } from "../models/tenant";
import type { TProfile } from "../schemas/profileSchema";
import { getTenantConnection } from "../tenantConnect";

export const getThemeColor = async (username?: string) => {
	if (!username) {
		const session = await getServerSession(authOptions);
		return session?.themeColor;
	}

	await connectPlatformDB();
	const client = await Clients.findOne({ slug: username.toLowerCase() });
	if (!client) return undefined;

	const conn = await getTenantConnection(client.databaseName);
	const models = getTenantModels(conn);
	const themeColor = (await models.Profiles.findOne<TProfile>({ restaurantID: username }))?.themeColor;
	return themeColor;
};
