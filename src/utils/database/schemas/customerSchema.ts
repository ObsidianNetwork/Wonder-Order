import type { HydratedDocument } from "mongoose";
import { Schema } from "mongoose";

export const CustomerSchema = new Schema<TCustomer>(
	{
		fname: { type: String, trim: true, required: true },
		lname: { type: String, trim: true, required: true },
		phone: { type: String, trim: true, unique: true, required: true, sparse: true, index: { unique: true } },
		email: { type: String, trim: true, unique: true, sparse: true, index: { unique: true } },
		gender: { type: String, trim: true, lowercase: true, enum: ["male", "female", "others"] },
	},
	{ timestamps: true },
);

export type TCustomer = HydratedDocument<{
	fname: string;
	lname: string;
	phone: string;
	email: string;
	gender: string;
}>;
