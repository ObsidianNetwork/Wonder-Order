import type { Connection, Model, Schema } from "mongoose";

import { AccountSchema, type TAccount } from "../schemas/accountSchema";
import { AIConfigSchema, type IAIConfig } from "../schemas/aiConfigSchema";
import { CustomerSchema, type TCustomer } from "../schemas/customerSchema";
import { KitchenSchema, type TKitchen } from "../schemas/kitchenSchema";
import { MenuSchema, type TMenu } from "../schemas/menuSchema";
import { OrderSchema, type TOrder } from "../schemas/orderSchema";
import { ProfileSchema, type TProfile } from "../schemas/profileSchema";
import { TableSchema, type TTable } from "../schemas/tableSchema";

export interface TenantModels {
	Accounts: Model<TAccount>;
	Profiles: Model<TProfile>;
	Menus: Model<TMenu>;
	Orders: Model<TOrder>;
	Kitchens: Model<TKitchen>;
	Tables: Model<TTable>;
	Customers: Model<TCustomer>;
	AIConfig: Model<IAIConfig>;
}

const modelCache = new Map<string, TenantModels>();

// biome-ignore lint/suspicious/noExplicitAny: Schema type variance requires any here
function getOrCreateModel(connection: Connection, name: string, schema: Schema<any>): Model<any> {
	return connection.models[name] ?? connection.model(name, schema);
}

export function getTenantModels(connection: Connection): TenantModels {
	const dbName = connection.name;
	const cached = modelCache.get(dbName);
	if (cached) return cached;

	const models: TenantModels = {
		Accounts: getOrCreateModel(connection, "accounts", AccountSchema),
		Profiles: getOrCreateModel(connection, "profiles", ProfileSchema),
		Menus: getOrCreateModel(connection, "menus", MenuSchema),
		Orders: getOrCreateModel(connection, "orders", OrderSchema),
		Kitchens: getOrCreateModel(connection, "kitchens", KitchenSchema),
		Tables: getOrCreateModel(connection, "tables", TableSchema),
		Customers: getOrCreateModel(connection, "customers", CustomerSchema),
		AIConfig: getOrCreateModel(connection, "AIConfig", AIConfigSchema),
	};

	modelCache.set(dbName, models);
	return models;
}
