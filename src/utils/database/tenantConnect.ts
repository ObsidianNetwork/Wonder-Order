import mongoose, { type Connection } from "mongoose";

interface TenantCache {
	connections: Map<string, Connection>;
}

const globalTenantCache = global as unknown as { tenantCache: TenantCache };

if (!globalTenantCache.tenantCache) {
	globalTenantCache.tenantCache = { connections: new Map() };
}

function buildTenantUri(databaseName: string): string {
	const uri = process.env.MONGODB_URI;
	if (!uri) throw new Error("MONGODB_URI is not set");
	// Parse the URI and replace the database name while preserving query params
	// mongodb://user:pass@host:port/existingdb?authSource=admin -> mongodb://user:pass@host:port/newdb?authSource=admin
	const match = uri.match(/^(mongodb(?:\+srv)?:\/\/[^/]+)(?:\/[^?]*)?(\?.*)?$/);
	if (!match) throw new Error("Invalid MONGODB_URI format");
	const base = match[1]; // everything up to the path
	const query = match[2] || ""; // query string including ?
	return `${base}/${databaseName}${query}`;
}

export async function getTenantConnection(databaseName: string): Promise<Connection> {
	const cached = globalTenantCache.tenantCache.connections.get(databaseName);

	if (cached && cached.readyState === 1) {
		return cached;
	}

	const tenantUri = buildTenantUri(databaseName);

	const connection = mongoose.createConnection(tenantUri, {
		maxPoolSize: 10,
		autoIndex: false,
	});

	connection.on("connected", () => {
		console.log(`🏪 Tenant DB connected: ${databaseName}`);
	});

	connection.on("error", (err) => {
		console.error(`🔴 Tenant DB error (${databaseName}):`, err);
	});

	await connection.asPromise();
	globalTenantCache.tenantCache.connections.set(databaseName, connection);

	return connection;
}
