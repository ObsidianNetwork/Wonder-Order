import type { HydratedDocument, Types } from "mongoose";
import { Schema } from "mongoose";

import type { TCustomer } from "./customerSchema";
import type { TMenu } from "./menuSchema";

const orderState = ["active", "reject", "cancel", "complete"] as const;
const paymentStatus = ["none", "pending", "paid", "failed", "refunded"] as const;

export const OrderSchema = new Schema<TOrder>(
	{
		restaurantID: { type: String, trim: true, lowercase: true, required: true },
		table: { type: String, trim: true, lowercase: true, required: true },
		customer: { type: Schema.Types.ObjectId, ref: "customers" },
		state: { type: String, trim: true, lowercase: true, enum: orderState, default: "active" },
		orderTotal: { type: Number },
		taxTotal: { type: Number },
		paymentIntentId: { type: String, sparse: true },
		paymentStatus: { type: String, enum: paymentStatus, default: "none" },
		amountPaid: { type: Number },
		products: [
			{
				product: { type: Schema.Types.ObjectId, ref: "menus" },
				quantity: { type: Number, default: 1 },
				price: { type: Number, required: true },
				tax: { type: Number, required: true },
				adminApproved: { type: Boolean, default: false },
				fulfilled: { type: Boolean, default: false },
			},
		],
	},
	{ timestamps: true },
);

OrderSchema.index({ restaurantID: 1 });
OrderSchema.index({ state: 1 });
OrderSchema.index({ restaurantID: 1, customer: 1, state: 1 });

OrderSchema.pre("save", function () {
	this.orderTotal = 0;
	this.taxTotal = 0;
	this?.products?.forEach(({ quantity, price, tax }) => {
		this.orderTotal += price * quantity;
		this.taxTotal += tax;
	});
});

export type TOrder = HydratedDocument<{
	restaurantID: string;
	table: string;
	customer: TCustomer;
	state: (typeof orderState)[number];
	orderTotal: number;
	taxTotal: number;
	paymentIntentId?: string;
	paymentStatus: (typeof paymentStatus)[number];
	amountPaid?: number;
	products: Array<TProduct>;
}>;

export type TProduct = TMenu & {
	_id: Types.ObjectId;
	product: TMenu;
	quantity: number;
	price: number;
	tax: number;
	fulfilled: boolean;
	adminApproved: boolean;
};
