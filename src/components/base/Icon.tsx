import clsx from "clsx";

interface IconProps {
	code: string;
	type?: "solid" | "regular";
	set?: string;
	size?: number;
	className?: string;
}

/** Remap Pro-only codes to FA6 Free equivalents */
const REMAP: Record<string, string> = {
	e09f: "f625", // gauge-high (dashboard)
	e3e3: "f2e7", // utensils (menu)
	e43b: "f07a", // cart-shopping (orders/basket)
	f067: "f055", // circle-plus
	f6d6: "f6d7", // drumstick-bite (non-veg)
	f7d4: "f544", // robot (chatbot)
	f86b: "e4c6", // bowl-food (kitchen)
};

export function Icon({ code, type = "solid", set, size, className }: IconProps) {
	const resolved = REMAP[code] ?? code;
	const isSolid = type === "solid" || set === "duotone" || set === "classic";

	return (
		<i
			className={clsx("inline-block leading-none", className)}
			style={{
				fontFamily: '"Font Awesome 6 Free"',
				fontWeight: isSolid ? 900 : 400,
				fontStyle: "normal",
				fontSize: size ? `${size}px` : undefined,
			}}
			aria-hidden="true"
		>
			{String.fromCodePoint(Number.parseInt(resolved, 16))}
		</i>
	);
}
