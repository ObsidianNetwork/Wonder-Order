import type { HydratedDocument } from "mongoose";
import { Schema } from "mongoose";

const FoodType = ["spicy", "extra-spicy", "sweet"] as const;
const Veg = ["veg", "non-veg", "contains-egg"] as const;

export const MenuSchema = new Schema<TMenu>(
	{
		name: { type: String, trim: true, required: true },
		restaurantID: { type: String, trim: true, lowercase: true, required: true, index: true },
		description: { type: String, trim: true },
		category: { type: String, trim: true, lowercase: true },
		price: { type: Number, trim: true, required: true },
		taxPercent: { type: Number, trim: true, required: true },
		foodType: { type: String, trim: true, lowercase: true, enum: FoodType },
		veg: { type: String, trim: true, lowercase: true, required: true, enum: Veg },
		image: { type: String, trim: true },
		hidden: { type: Boolean, default: true },
	},
	{ timestamps: true },
);

MenuSchema.index({ name: 1, restaurantID: 1 }, { unique: true });

export type TMenu = HydratedDocument<{
	name: string;
	restaurantID: string;
	description: string;
	category: string;
	price: number;
	taxPercent: number;
	foodType: TFoodType;
	veg: TVeg;
	image: string;
	hidden: boolean;
}>;

export type TFoodType = (typeof FoodType)[number];
export type TVeg = (typeof Veg)[number];
