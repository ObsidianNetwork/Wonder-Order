// Centralised app configuration
// Update these values to customise the platform for your market

export const APP = {
	name: "Wonder-Order",
	tagline: "Revolutionizing Dining Experience",
	description:
		"Contactless restaurant ordering powered by AI. Scan a QR code, browse the menu, chat with an AI assistant, and place your order — no app download required.",
	url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://wonder-order.com",
	assistantName: "Wonder",
} as const;

export const LOCALE = {
	currencySymbol: "$",
	currencyCode: "AUD",
	countryCode: "AU",
	dialCode: "61",
} as const;
