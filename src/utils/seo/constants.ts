import { APP } from "#utils/config/constants";

export const SITE_NAME = APP.name;

export const SITE_URL = APP.url;

export const SITE_DESCRIPTION = APP.description;

export const SITE_TAGLINE = APP.tagline;

export const SITE_KEYWORDS = [
	"contactless ordering",
	"restaurant ordering system",
	"QR code menu",
	"digital menu",
	"online food ordering",
	"AI restaurant assistant",
	"smart dining",
	"contactless dining",
	"restaurant management",
	"kitchen dashboard",
	"order management system",
	"food ordering platform",
	"QR code ordering",
	"restaurant technology",
	"Wonder-Order",
] as const;

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;
