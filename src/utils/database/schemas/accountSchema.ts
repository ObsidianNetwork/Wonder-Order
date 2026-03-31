import type { HydratedDocument } from "mongoose";
import { Schema } from "mongoose";

import { hashPassword } from "#utils/helper/passwordHelper";

import type { TKitchen } from "./kitchenSchema";
import type { TMenu } from "./menuSchema";
import type { TProfile } from "./profileSchema";
import type { TTable } from "./tableSchema";

export const AccountSchema = new Schema<TAccount>(
	{
		username: { type: String, trim: true, lowercase: true, unique: true, required: true, sparse: true, index: { unique: true } },
		email: { type: String, trim: true, lowercase: true, unique: true, required: true, sparse: true, index: { unique: true } },
		password: { type: String, required: true },
		verified: { type: Boolean, default: false },
		accountActive: { type: Boolean, default: true },
		subscriptionActive: { type: Boolean, default: true },
		profile: { type: Schema.Types.ObjectId, ref: "profiles", unique: true },
		kitchens: [{ type: Schema.Types.ObjectId, ref: "kitchens" }],
		tables: [{ type: Schema.Types.ObjectId, ref: "tables" }],
		menus: [{ type: Schema.Types.ObjectId, ref: "menus" }],
	},
	{ timestamps: true },
);

AccountSchema.pre("save", async function () {
	if (this.isModified("password")) this.password = await hashPassword(this?.password);
});

export type TAccount = HydratedDocument<{
	username: string;
	email: string;
	password: string;
	verified: boolean;
	accountActive: boolean;
	subscriptionActive: boolean;
	profile: TProfile;
	kitchens: Array<TKitchen>;
	tables: Array<TTable>;
	menus: Array<TMenu>;
}>;
