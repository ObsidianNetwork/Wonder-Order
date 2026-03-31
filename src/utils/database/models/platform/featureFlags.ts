import mongoose, { type HydratedDocument } from "mongoose";

const FeatureFlagsSchema = new mongoose.Schema<TFeatureFlags>(
	{
		clientId: { type: String, unique: true, required: true, index: true },
		aiChat: { type: Boolean, default: false },
		qrScanning: { type: Boolean, default: true },
		kitchenDashboard: { type: Boolean, default: true },
		onlinePayment: { type: Boolean, default: false },
		orderHistory: { type: Boolean, default: true },
	},
	{ timestamps: true },
);

export const FeatureFlags = mongoose.models?.featureFlags ?? mongoose.model<TFeatureFlags>("featureFlags", FeatureFlagsSchema);

export type TFeatureFlags = HydratedDocument<{
	clientId: string;
	aiChat: boolean;
	qrScanning: boolean;
	kitchenDashboard: boolean;
	onlinePayment: boolean;
	orderHistory: boolean;
}>;
