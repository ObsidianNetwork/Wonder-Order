"use client";

import { useEffect, useState } from "react";

interface ScreenTypeConfig {
	mobile?: number;
}

interface ScreenType {
	isMobile: boolean;
}

export function useScreenType(config?: ScreenTypeConfig): ScreenType {
	const breakpoint = config?.mobile ?? 768;
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
		setIsMobile(mq.matches);
		const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, [breakpoint]);

	return { isMobile };
}
