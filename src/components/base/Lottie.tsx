"use client";

import { useEffect, useRef } from "react";

interface LottieProps {
	src: string;
	size?: number;
	speed?: number;
	className?: string;
}

/**
 * Plays a dotLottie/Lottie animation from a URL.
 * Uses the lightweight dotlottie-wc web component via CDN.
 */
export function Lottie({ src, size, speed, className }: LottieProps) {
	const ref = useRef<HTMLDivElement>(null);
	const loaded = useRef(false);

	useEffect(() => {
		if (loaded.current) return;
		if (!customElements.get("dotlottie-wc")) {
			const script = document.createElement("script");
			script.src = "https://unpkg.com/@nicepkg/dotlottie-wc@latest/dist/dotlottie-wc.js";
			script.type = "module";
			document.head.appendChild(script);
		}
		loaded.current = true;
	}, []);

	return (
		<div
			ref={ref}
			className={className}
			style={size ? { width: size, height: size } : undefined}
		>
			{/* @ts-expect-error — web component */}
			<dotlottie-wc
				src={src}
				autoplay
				loop
				speed={speed ?? 1}
				style={{ width: "100%", height: "100%" }}
			/>
		</div>
	);
}
