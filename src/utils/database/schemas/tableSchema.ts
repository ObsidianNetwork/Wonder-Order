import { Schema } from "mongoose";

export const TableSchema = new Schema<TTable>(
	{
		name: { type: String, trim: true, required: true },
		username: { type: String, trim: true, required: true },
		restaurantID: { type: String, trim: true, lowercase: true, required: true },
	},
	{ timestamps: true },
);

TableSchema.index({ username: 1, restaurantID: 1 }, { unique: true });

export type TTable = {
	name: string;
	username: string;
	restaurantID: string;
};
