import { connect } from "mongoose";
// Import platform models so they register on the default connection
import "./models/platform/client";
import "./models/platform/clientTheme";
import "./models/platform/counter";
import "./models/platform/featureFlags";
import "./models/platform/platformAdmin";

if (!process.env.MONGODB_URI) {
	throw new Error("Please add your MongoDB URI to Environment Variables.");
}

function getPlatformUri(): string {
	const uri = process.env.MONGODB_URI as string;
	const match = uri.match(/^(mongodb(?:\+srv)?:\/\/[^/]+)(?:\/[^?]*)?(\?.*)?$/);
	if (!match) throw new Error("Invalid MONGODB_URI format");
	return `${match[1]}/wonder_platform${match[2] || ""}`;
}

const options = {
	autoIndex: false,
};
let cached = global.mongoose;

if (!cached) {
	cached = global.mongoose = { conn: null, promise: null };
}

async function connectPlatformDB() {
	if (cached.conn) return cached.conn;
	if (!cached.promise) {
		console.log("🌿 Connecting to Platform DB");
		cached.promise = connect(getPlatformUri(), options)
			.then((mongoose) => {
				console.log("🍃 Platform DB Connection Established");
				return mongoose;
			})
			.catch((error) => {
				console.error("🍂 Platform DB Connection Failed: ", error);
			});
	}

	try {
		cached.conn = await cached.promise;
	} catch (e) {
		cached.promise = null;
		throw e;
	}

	return cached.conn;
}

export default connectPlatformDB;
