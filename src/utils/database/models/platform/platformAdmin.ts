import mongoose, { type HydratedDocument } from "mongoose";

import { hashPassword } from "#utils/helper/passwordHelper";

const PlatformAdminSchema = new mongoose.Schema<TPlatformAdmin>(
	{
		email: { type: String, trim: true, lowercase: true, unique: true, required: true, index: true },
		password: { type: String, required: true },
		name: { type: String, trim: true, required: true },
		active: { type: Boolean, default: true },
	},
	{ timestamps: true },
);

PlatformAdminSchema.pre("save", async function () {
	if (this.isModified("password")) this.password = await hashPassword(this.password);
});

export const PlatformAdmins = mongoose.models?.platformAdmins ?? mongoose.model<TPlatformAdmin>("platformAdmins", PlatformAdminSchema);

export type TPlatformAdmin = HydratedDocument<{
	email: string;
	password: string;
	name: string;
	active: boolean;
}>;
