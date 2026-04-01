"use client";

import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

export type ThemeColor = { h: number; s: number; l: number };
export type ThemeScheme = "light" | "dark" | "auto";

interface ThemeContextValue {
	isDarkTheme: boolean;
	themeScheme: ThemeScheme;
	setThemeScheme: (scheme: ThemeScheme) => void;
	themeColor: ThemeColor | undefined;
	setThemeColor: (color: ThemeColor | undefined) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_SCHEME = "xThemeScheme";
const STORAGE_COLOR = "xThemeColor";

function applyColorVars(color: ThemeColor) {
	const style =
		document.getElementById("xThemeColor") ||
		document.head.appendChild(
			Object.assign(document.createElement("style"), { id: "xThemeColor" }),
		);
	style.textContent = `:root{ --H: ${color.h}; --S: ${color.s}%; --L: ${color.l}% }`;

	let meta = document.head.querySelector<HTMLMetaElement>(
		'meta[name="theme-color"]',
	);
	if (!meta) {
		meta = document.createElement("meta");
		meta.name = "theme-color";
		document.head.appendChild(meta);
	}
	meta.content = `hsl(${color.h},${color.s}%,${color.l}%)`;
}

function resolveIsDark(scheme: ThemeScheme): boolean {
	if (scheme === "dark") return true;
	if (scheme === "light") return false;
	if (typeof window !== "undefined") {
		return window.matchMedia("(prefers-color-scheme: dark)").matches;
	}
	return false;
}

export function ThemeProvider({ children }: { children?: ReactNode }) {
	const [themeScheme, setThemeSchemeState] = useState<ThemeScheme>("auto");
	const [themeColor, setThemeColorState] = useState<ThemeColor | undefined>();
	const [isDarkTheme, setIsDarkTheme] = useState(false);

	// Init from localStorage
	useEffect(() => {
		const storedScheme =
			(localStorage.getItem(STORAGE_SCHEME) as ThemeScheme) || "auto";
		setThemeSchemeState(storedScheme);
		setIsDarkTheme(resolveIsDark(storedScheme));
		document.documentElement.setAttribute("data-theme-scheme", storedScheme);

		try {
			const raw = localStorage.getItem(STORAGE_COLOR);
			if (raw) {
				const parsed = JSON.parse(raw);
				if (parsed?.h != null && parsed?.s != null && parsed?.l != null) {
					setThemeColorState(parsed);
					applyColorVars(parsed);
				}
			}
		} catch {}
	}, []);

	// Listen for system preference changes when in auto mode
	useEffect(() => {
		if (themeScheme !== "auto") return;
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const handler = (e: MediaQueryListEvent) => setIsDarkTheme(e.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, [themeScheme]);

	const setThemeScheme = useCallback((scheme: ThemeScheme) => {
		setThemeSchemeState(scheme);
		setIsDarkTheme(resolveIsDark(scheme));
		localStorage.setItem(STORAGE_SCHEME, scheme);
		document.documentElement.setAttribute("data-theme-scheme", scheme);
	}, []);

	const setThemeColor = useCallback((color: ThemeColor | undefined) => {
		setThemeColorState(color);
		if (color) {
			applyColorVars(color);
			localStorage.setItem(STORAGE_COLOR, JSON.stringify(color));
		}
	}, []);

	const value = useMemo(
		() => ({ isDarkTheme, themeScheme, setThemeScheme, themeColor, setThemeColor }),
		[isDarkTheme, themeScheme, setThemeScheme, themeColor, setThemeColor],
	);

	return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme(): ThemeContextValue {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
	return ctx;
}
