import connectPlatformDB from "#utils/database/connect";
import { Clients, type TClient } from "#utils/database/models/platform/client";

// In-memory cache for slug -> client mapping (refreshed on miss)
const slugCache = new Map<string, { client: TClient; cachedAt: number }>();
const CACHE_TTL = 60_000; // 1 minute

export async function resolveClientBySlug(slug: string): Promise<TClient | null> {
	const cached = slugCache.get(slug);
	if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
		return cached.client;
	}

	await connectPlatformDB();
	const client = await Clients.findOne({ slug: slug.toLowerCase() });
	if (client) {
		slugCache.set(slug, { client, cachedAt: Date.now() });
	}
	return client;
}

export function invalidateSlugCache(slug: string) {
	slugCache.delete(slug);
}
