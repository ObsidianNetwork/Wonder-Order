import type { ThemeColor } from "./ThemeProvider";

export interface WonderTheme {
	id: string;
	name: string;
	description: string;
	brand: ThemeColor;
	surfaces: {
		light: { s0: string; s1: string; s2: string; border: string };
		dark: { s0: string; s1: string; s2: string; border: string };
	};
	text: {
		light: { primary: string; secondary: string; muted: string };
		dark: { primary: string; secondary: string; muted: string };
	};
	radius: { sm: string; md: string; lg: string; xl: string };
	shadow: "soft" | "sharp" | "none";
}

export const themes: Record<string, WonderTheme> = {
	midnight: {
		id: "midnight",
		name: "Midnight",
		description: "Deep purple tones, soft edges",
		brand: { h: 280, s: 40, l: 55 },
		surfaces: {
			light: { s0: "#ffffff", s1: "#f8f8fa", s2: "#f0f0f5", border: "#e8e8ee" },
			dark: { s0: "#0a0a0f", s1: "#12121c", s2: "#1a1a2e", border: "#27273a" },
		},
		text: {
			light: { primary: "#1a1a2e", secondary: "#6b6b80", muted: "#a0a0b0" },
			dark: { primary: "#e4e4e7", secondary: "#a1a1aa", muted: "#52525b" },
		},
		radius: { sm: "8px", md: "12px", lg: "16px", xl: "24px" },
		shadow: "soft",
	},
	ember: {
		id: "ember",
		name: "Ember",
		description: "Warm sunset tones, inviting feel",
		brand: { h: 19, s: 100, l: 56 },
		surfaces: {
			light: { s0: "#fffcfa", s1: "#fdf5ef", s2: "#faeee4", border: "#f0ddd0" },
			dark: { s0: "#0f0a08", s1: "#1a1210", s2: "#261c18", border: "#3a2c24" },
		},
		text: {
			light: { primary: "#2e1a0e", secondary: "#806b5c", muted: "#b0a090" },
			dark: { primary: "#e7e0d8", secondary: "#aaa196", muted: "#5b524a" },
		},
		radius: { sm: "10px", md: "14px", lg: "20px", xl: "28px" },
		shadow: "soft",
	},
	ocean: {
		id: "ocean",
		name: "Ocean",
		description: "Cool blue, clean and modern",
		brand: { h: 205, s: 75, l: 50 },
		surfaces: {
			light: { s0: "#fafcff", s1: "#f0f5fa", s2: "#e6eef5", border: "#d0dde8" },
			dark: { s0: "#080a0f", s1: "#0f141c", s2: "#151e2e", border: "#233044" },
		},
		text: {
			light: { primary: "#0e1a2e", secondary: "#5c6b80", muted: "#90a0b0" },
			dark: { primary: "#d8e0e7", secondary: "#96a1aa", muted: "#4a525b" },
		},
		radius: { sm: "6px", md: "10px", lg: "14px", xl: "20px" },
		shadow: "sharp",
	},
	forest: {
		id: "forest",
		name: "Forest",
		description: "Earthy greens, natural warmth",
		brand: { h: 145, s: 45, l: 42 },
		surfaces: {
			light: { s0: "#fafff9", s1: "#f0f5ee", s2: "#e4ede2", border: "#cfd8cc" },
			dark: { s0: "#080f08", s1: "#101a10", s2: "#182618", border: "#2a3a28" },
		},
		text: {
			light: { primary: "#1a2e1a", secondary: "#5c7060", muted: "#90a894" },
			dark: { primary: "#d8e7d8", secondary: "#96aa98", muted: "#4a5b4c" },
		},
		radius: { sm: "8px", md: "12px", lg: "16px", xl: "24px" },
		shadow: "soft",
	},
	slate: {
		id: "slate",
		name: "Slate",
		description: "Neutral grey, minimal and sharp",
		brand: { h: 220, s: 15, l: 50 },
		surfaces: {
			light: { s0: "#ffffff", s1: "#f5f5f7", s2: "#ececf0", border: "#dcdce2" },
			dark: { s0: "#0c0c0e", s1: "#141416", s2: "#1c1c20", border: "#2a2a30" },
		},
		text: {
			light: { primary: "#1c1c22", secondary: "#6b6b76", muted: "#a0a0aa" },
			dark: { primary: "#e0e0e4", secondary: "#9a9aa2", muted: "#50505a" },
		},
		radius: { sm: "4px", md: "6px", lg: "8px", xl: "12px" },
		shadow: "sharp",
	},
	cherry: {
		id: "cherry",
		name: "Cherry",
		description: "Bold red, high energy",
		brand: { h: 350, s: 70, l: 50 },
		surfaces: {
			light: { s0: "#fffafa", s1: "#fdf0f0", s2: "#fae4e4", border: "#f0d0d0" },
			dark: { s0: "#0f0808", s1: "#1a1010", s2: "#261818", border: "#3a2424" },
		},
		text: {
			light: { primary: "#2e0e14", secondary: "#805c62", muted: "#b09096" },
			dark: { primary: "#e7d8da", secondary: "#aa9698", muted: "#5b4a4e" },
		},
		radius: { sm: "8px", md: "12px", lg: "16px", xl: "24px" },
		shadow: "soft",
	},
	sand: {
		id: "sand",
		name: "Sand",
		description: "Warm neutral, cafe aesthetic",
		brand: { h: 32, s: 50, l: 48 },
		surfaces: {
			light: { s0: "#fefcf8", s1: "#f8f2ea", s2: "#f0e8dc", border: "#e0d4c4" },
			dark: { s0: "#0e0c08", s1: "#181410", s2: "#241e16", border: "#383024" },
		},
		text: {
			light: { primary: "#2a2218", secondary: "#7a6e5e", muted: "#a89888" },
			dark: { primary: "#e8e0d4", secondary: "#a89a8c", muted: "#585048" },
		},
		radius: { sm: "10px", md: "14px", lg: "20px", xl: "28px" },
		shadow: "soft",
	},
	neon: {
		id: "neon",
		name: "Neon",
		description: "Electric cyan, dark-first nightlife vibe",
		brand: { h: 175, s: 100, l: 45 },
		surfaces: {
			light: { s0: "#f8fffd", s1: "#eef8f6", s2: "#e0f2ee", border: "#c8e6e0" },
			dark: { s0: "#040a0a", s1: "#0a1414", s2: "#0e1e1e", border: "#1a3030" },
		},
		text: {
			light: { primary: "#0e2e28", secondary: "#5c807a", muted: "#90b0aa" },
			dark: { primary: "#d8f0ea", secondary: "#88aaa4", muted: "#405a56" },
		},
		radius: { sm: "4px", md: "8px", lg: "12px", xl: "16px" },
		shadow: "none",
	},
} as const;

export const DEFAULT_THEME_ID = "midnight";
export const DEFAULT_THEME = themes[DEFAULT_THEME_ID];
export const DEFAULT_THEME_COLOR = DEFAULT_THEME.brand;

export function isValidThemeColor(c?: ThemeColor): c is ThemeColor {
	return (
		c != null &&
		typeof c === "object" &&
		typeof c.h === "number" &&
		typeof c.s === "number" &&
		typeof c.l === "number"
	);
}

/** Get a theme by ID, falling back to the default */
export function getTheme(id?: string | null): WonderTheme {
	if (id && id in themes) return themes[id];
	return DEFAULT_THEME;
}
