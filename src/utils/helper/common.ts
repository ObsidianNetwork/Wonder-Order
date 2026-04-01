import forEach from "lodash/forEach";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { NextResponse } from "next/server";

export const fetcher = (url: string) => fetch(url).then((r) => r.json());
export const CatchNextResponse = ({ message = "Something went wrong", status = 500 }: NextResponseError) => {
	return NextResponse.json({ message, status }, { status });
};

export const scrollToSection = (section?: string) => {
	const element = document.getElementById(section ? section : "homepage") as HTMLDivElement;
	if (!element) return;

	const snapContainer = element.closest(".snapScroll") as HTMLElement;
	const scrollContainer = snapContainer ?? document.documentElement;
	if (snapContainer) snapContainer.style.scrollSnapType = "none";

	const isMobile = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

	if (isMobile) {
		// Mobile: instant snap
		element.scrollIntoView({ behavior: "instant" as ScrollBehavior });
		if (snapContainer) snapContainer.style.scrollSnapType = "";
	} else {
		// Desktop: controlled smooth scroll
		const targetY = element.getBoundingClientRect().top + scrollContainer.scrollTop;
		const startY = scrollContainer.scrollTop;
		const distance = targetY - startY;
		const duration = 800;
		let startTime = 0;

		const animate = (time: number) => {
			if (!startTime) startTime = time;
			const p = Math.min((time - startTime) / duration, 1);
			const ease = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
			scrollContainer.scrollTop = startY + distance * ease;
			if (p < 1) requestAnimationFrame(animate);
			else if (snapContainer) snapContainer.style.scrollSnapType = "";
		};
		requestAnimationFrame(animate);
	}
};

export const isEmailValid = (email?: string) => {
	const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
	return emailPattern.test(email ?? "");
};

export const createQueryString = (searchParams: ReadonlyURLSearchParams, query: Record<string, string>) => {
	const params = new URLSearchParams(searchParams);
	forEach(query, (value, key) => params.set(key, value));
	return params.toString();
};

export const splitStringByFirstWord = (sentence: string) => {
	if (!sentence) {
		return;
	}

	sentence = sentence.trim();
	return [
		sentence.replace(/ .*/, ""), // Get first word from sentence
		sentence.replace(/\w+ /, ""), // Get remaining sentence except first word
	];
};
