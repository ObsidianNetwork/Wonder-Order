import forEach from "lodash/forEach";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { NextResponse } from "next/server";

export const fetcher = (url: string) => fetch(url).then((r) => r.json());
export const CatchNextResponse = ({ message = "Something went wrong", status = 500 }: NextResponseError) => {
	return NextResponse.json({ message, status }, { status });
};

export const scrollToSection = (section?: string) => {
	const element = document.getElementById(section ?? "homepage");
	if (!element) return;

	const container = (element.closest(".snapScroll") as HTMLElement) ?? document.documentElement;
	const targetY = element.getBoundingClientRect().top + container.scrollTop;
	const isMobile = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

	if (isMobile) {
		container.scrollTo({ top: targetY });
	} else {
		const startY = container.scrollTop;
		const distance = targetY - startY;
		const duration = 700;
		let start = 0;

		const step = (time: number) => {
			if (!start) start = time;
			const p = Math.min((time - start) / duration, 1);
			const ease = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
			container.scrollTop = startY + distance * ease;
			if (p < 1) requestAnimationFrame(step);
		};
		requestAnimationFrame(step);
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
