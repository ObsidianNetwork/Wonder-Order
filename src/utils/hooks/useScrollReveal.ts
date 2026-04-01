import { useEffect, useRef } from "react";

/**
 * Adds 'visible' class to elements with 'scrollReveal' or children of 'scrollRevealStagger'
 * when they enter the viewport. Uses IntersectionObserver.
 */
export function useScrollReveal(containerRef: React.RefObject<HTMLElement | null>) {
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add("visible");
					}
				}
			},
			{ threshold: 0.15, root: container },
		);

		// Observe elements with scrollReveal class
		const revealElements = Array.from(container.querySelectorAll(".scrollReveal"));
		revealElements.forEach((el) => observer.observe(el));

		// Observe children of scrollRevealStagger
		const staggerContainers = Array.from(container.querySelectorAll(".scrollRevealStagger"));
		staggerContainers.forEach((stagger) => {
			Array.from(stagger.children).forEach((child) => observer.observe(child));
		});

		return () => observer.disconnect();
	}, [containerRef]);
}

/**
 * Tracks scroll position and returns a parallax offset value.
 * Use on a snap scroll container.
 */
export function useParallax() {
	const scrollRef = useRef<HTMLDivElement>(null);
	const parallaxRef = useRef(0);

	const onScroll = () => {
		if (scrollRef.current) {
			parallaxRef.current = scrollRef.current.scrollTop;
		}
	};

	return { scrollRef, parallaxRef, onScroll };
}
