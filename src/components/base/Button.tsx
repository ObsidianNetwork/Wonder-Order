"use client";

import clsx from "clsx";
import type { CSSProperties, MouseEventHandler } from "react";
import { Icon } from "./Icon";
import { Spinner } from "./Spinner";

type ButtonType = "primary" | "secondary" | "primaryDanger" | "secondaryDanger";
type ButtonSize = "mini" | "default";

interface ButtonProps {
	label?: string;
	icon?: string;
	iconType?: "solid" | "regular";
	iconSet?: string;
	type?: ButtonType;
	size?: ButtonSize;
	loading?: boolean;
	disabled?: boolean;
	onClick?: MouseEventHandler<HTMLButtonElement>;
	className?: string;
	style?: CSSProperties;
}

const typeClasses: Record<ButtonType, string> = {
	primary:
		"bg-[hsl(var(--colorBrandPrimary))] text-white hover:brightness-110 active:brightness-90",
	secondary:
		"bg-transparent text-[hsl(var(--colorBrandPrimary))] border border-[hsl(var(--colorBrandPrimary))] hover:bg-[hsl(var(--colorBrandPrimary)/0.08)] active:bg-[hsl(var(--colorBrandPrimary)/0.15)]",
	primaryDanger:
		"bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
	secondaryDanger:
		"bg-transparent text-red-600 border border-red-600 hover:bg-red-600/8 active:bg-red-600/15",
};

export function Button({
	label,
	icon,
	iconType,
	iconSet,
	type = "primary",
	size = "default",
	loading = false,
	disabled = false,
	onClick,
	className,
	style,
}: ButtonProps) {
	const isIconOnly = icon && !label;

	return (
		<button
			type="button"
			disabled={disabled || loading}
			onClick={onClick}
			style={style}
			className={clsx(
				"inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer select-none",
				"disabled:opacity-50 disabled:cursor-not-allowed",
				typeClasses[type],
				size === "mini"
					? isIconOnly
						? "h-8 w-8 rounded-lg text-xs"
						: "h-8 px-3 rounded-lg text-xs"
					: isIconOnly
						? "h-11 w-11 rounded-xl text-sm"
						: "h-11 px-5 rounded-xl text-sm",
				className,
			)}
		>
			{loading ? (
				<Spinner className="h-4 w-4" />
			) : (
				<>
					{icon && <Icon code={icon} type={iconType} set={iconSet} size={size === "mini" ? 12 : 14} />}
					{label && <span>{label}</span>}
				</>
			)}
		</button>
	);
}
