import clsx from "clsx";

interface IconProps {
	code: string;
	type?: "solid" | "regular";
	set?: string;
	size?: number;
	className?: string;
}

/**
 * Renders a Font Awesome icon using unicode code points.
 * Replaces xtreme-ui's Icon component.
 *
 * Usage: <Icon code="f00d" type="solid" />
 */
export function Icon({ code, type = "regular", set, size, className }: IconProps) {
	const family =
		set === "duotone"
			? "Font Awesome 6 Duotone"
			: "Font Awesome 6 Free";

	const weight = type === "solid" || set === "duotone" ? 900 : 400;

	return (
		<i
			className={clsx("inline-block leading-none", className)}
			style={{
				fontFamily: `"${family}"`,
				fontWeight: weight,
				fontStyle: "normal",
				fontSize: size ? `${size}px` : undefined,
			}}
			aria-hidden="true"
		>
			{String.fromCodePoint(Number.parseInt(code, 16))}
		</i>
	);
}
