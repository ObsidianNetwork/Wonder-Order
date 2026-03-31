// Centralised app configuration
// These are platform-level defaults. Per-client values come from the database.

export const APP = {
	name: "Wonder-Order",
	tagline: "Revolutionizing Dining Experience",
	description:
		"Contactless restaurant ordering powered by AI. Scan a QR code, browse the menu, chat with an AI assistant, and place your order — no app download required.",
	url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://wonder-order.com",
	assistantName: "Wonder",
} as const;

export const LOCALE = {
	// Defaults -- can be overridden per client
	currencySymbol: "$",
	defaultDialCode: "61",
} as const;
