import { Schema } from "mongoose";

export interface IAIConfig {
	exhaustedProviders: string[];
}

export const AIConfigSchema = new Schema<IAIConfig>(
	{
		exhaustedProviders: {
			type: [String],
			default: [],
		},
	},
	{ timestamps: true },
);
