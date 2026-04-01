import mongoose, { type HydratedDocument } from "mongoose";

const clientStatus = ["active", "suspended", "trial", "cancelled"] as const;

const ClientSchema = new mongoose.Schema<TClient>(
	{
		clientId: { type: String, unique: true, required: true, index: true },
		abn: { type: String, unique: true, sparse: true, match: /^\d{11}$/ },
		slug: { type: String, unique: true, lowercase: true, trim: true, required: true, index: true },
		name: { type: String, trim: true, required: true },
		email: { type: String, trim: true, lowercase: true, required: true },
		status: { type: String, enum: clientStatus, default: "trial" },
		databaseName: { type: String, unique: true, required: true },
		stripeAccountId: { type: String, sparse: true },
		stripeOnboarded: { type: Boolean, default: false },
	},
	{ timestamps: true },
);

export const Clients = mongoose.models?.clients ?? mongoose.model<TClient>("clients", ClientSchema);

export type TClient = HydratedDocument<{
	clientId: string;
	abn: string;
	slug: string;
	name: string;
	email: string;
	status: (typeof clientStatus)[number];
	databaseName: string;
	stripeAccountId?: string;
	stripeOnboarded: boolean;
}>;
