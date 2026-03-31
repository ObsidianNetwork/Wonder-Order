import type { HydratedDocument } from "mongoose";
import { Schema } from "mongoose";
import type { TThemeColor } from "xtreme-ui";

export const ProfileSchema = new Schema<TProfile>(
	{
		name: { type: String, trim: true, required: true },
		restaurantID: { type: String, trim: true, lowercase: true, unique: true, required: true, sparse: true, index: { unique: true } },
		description: { type: String, trim: true },
		address: { type: String, trim: true },
		themeColor: {
			h: { type: Number, trim: true, min: 0, max: 360 },
			s: { type: Number, trim: true, min: 0, max: 100 },
			l: { type: Number, trim: true, min: 0, max: 100 },
		},
		gstInclusive: { type: Boolean, default: false },
		categories: [{ type: String, trim: true, lowercase: true, match: /^[^,]*$/ }],
		avatar: { type: String, trim: true },
		cover: { type: String, trim: true },
		photos: [{ type: String, trim: true }],
	},
	{ timestamps: true },
);

ProfileSchema.pre("save", function () {
	this.categories = Array.from(new Set(this.categories));
});

export type TProfile = HydratedDocument<{
	name: string;
	restaurantID: string;
	description: string;
	address: string;
	avatar: string;
	cover: string;
	photos: Array<string>;
	themeColor: TThemeColor;
	gstInclusive: boolean;
	categories: Array<string>;
}>;
