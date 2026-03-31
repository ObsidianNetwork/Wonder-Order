import mongoose, { type HydratedDocument } from "mongoose";

const HSLSchema = {
	h: { type: Number, min: 0, max: 360, default: 220 },
	s: { type: Number, min: 0, max: 100, default: 70 },
	l: { type: Number, min: 0, max: 100, default: 50 },
};

const layoutVariants = ["grid", "list", "compact"] as const;

const ClientThemeSchema = new mongoose.Schema<TClientTheme>(
	{
		clientId: { type: String, unique: true, required: true, index: true },
		colors: {
			primary: HSLSchema,
			secondary: { ...HSLSchema, h: { ...HSLSchema.h, default: 200 } },
			accent: { ...HSLSchema, h: { ...HSLSchema.h, default: 40 } },
		},
		fonts: {
			heading: { type: String, trim: true, default: "Montserrat" },
			body: { type: String, trim: true, default: "Montserrat" },
		},
		logo: { type: String, trim: true },
		coverImage: { type: String, trim: true },
		layoutVariant: { type: String, enum: layoutVariants, default: "grid" },
		customCSS: { type: String, default: "" },
	},
	{ timestamps: true },
);

export const ClientThemes = mongoose.models?.clientThemes ?? mongoose.model<TClientTheme>("clientThemes", ClientThemeSchema);

export type THSLColor = { h: number; s: number; l: number };

export type TClientTheme = HydratedDocument<{
	clientId: string;
	colors: {
		primary: THSLColor;
		secondary: THSLColor;
		accent: THSLColor;
	};
	fonts: {
		heading: string;
		body: string;
	};
	logo: string;
	coverImage: string;
	layoutVariant: (typeof layoutVariants)[number];
	customCSS: string;
}>;
