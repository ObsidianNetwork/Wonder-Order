import connectPlatformDB from "./connect";
import { Clients } from "./models/platform/client";
import type { TenantModels } from "./models/tenant";
import { getTenantModels } from "./models/tenant";
import { getTenantConnection } from "./tenantConnect";

/**
 * Get tenant models from a session that contains clientId.
 * Use this in API routes that have an authenticated session.
 */
export async function getTenantFromSession(session: { clientId?: string; username?: string }): Promise<TenantModels> {
	await connectPlatformDB();

	let client = null;

	// Try clientId first, fall back to username (slug) lookup
	if (session?.clientId) {
		client = await Clients.findOne({ clientId: session.clientId });
	}
	if (!client && session?.username) {
		client = await Clients.findOne({ slug: session.username });
	}

	if (!client) throw { status: 403, message: "No client context in session" };
	if (client.status !== "active" && client.status !== "trial") throw { status: 403, message: "Client is not active" };

	const connection = await getTenantConnection(client.databaseName);
	return getTenantModels(connection);
}

/**
 * Get tenant models from a restaurant slug (for public/unauthenticated routes).
 * Also returns the client record for additional context.
 */
export async function getTenantFromSlug(slug: string) {
	await connectPlatformDB();
	const client = await Clients.findOne({ slug: slug.toLowerCase() });
	if (!client) throw { status: 404, message: "Restaurant not found" };
	if (client.status !== "active" && client.status !== "trial") throw { status: 403, message: "Restaurant is not available" };

	const connection = await getTenantConnection(client.databaseName);
	const models = getTenantModels(connection);
	return { models, client };
}
