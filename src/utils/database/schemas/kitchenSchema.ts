import { Schema } from "mongoose";

import { hashPassword } from "#utils/helper/passwordHelper";

export const KitchenSchema = new Schema<TKitchen>(
	{
		username: { type: String, trim: true, unique: true, required: true, sparse: true, index: { unique: true } },
		password: { type: String, required: true },
		restaurantID: { type: String, trim: true, lowercase: true, required: true, index: true },
	},
	{ timestamps: true },
);

KitchenSchema.pre("save", async function () {
	if (this.isModified("password")) this.password = await hashPassword(this.password);
});

export type TKitchen = {
	username: string;
	password: string;
	restaurantID: string;
};
