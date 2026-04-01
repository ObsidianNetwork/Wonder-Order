"use client";

import clsx from "clsx";
import type { ChangeEventHandler, HTMLInputTypeAttribute, KeyboardEvent } from "react";
import { Icon } from "./Icon";

interface TextfieldProps {
	placeholder?: string;
	value?: string | number;
	onChange?: ChangeEventHandler<HTMLInputElement>;
	onEnterKey?: () => void;
	type?: HTMLInputTypeAttribute;
	icon?: string;
	iconType?: "solid" | "regular";
	disabled?: boolean;
	className?: string;
	min?: number;
	max?: number;
	step?: number;
	autoFocus?: boolean;
}

export function Textfield({
	placeholder,
	value,
	onChange,
	onEnterKey,
	type = "text",
	icon,
	iconType,
	disabled,
	className,
	min,
	max,
	step,
	autoFocus,
}: TextfieldProps) {
	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && onEnterKey) onEnterKey();
	};

	return (
		<div
			className={clsx(
				"flex items-center gap-2 h-11 px-3 rounded-xl bg-[var(--wo-surface-1)] border border-[var(--wo-surface-border)] transition-colors duration-200",
				"focus-within:border-[hsl(var(--colorBrandPrimary))] focus-within:ring-1 focus-within:ring-[hsl(var(--colorBrandPrimary)/0.3)]",
				disabled && "opacity-50 cursor-not-allowed",
				className,
			)}
		>
			{icon && (
				<Icon
					code={icon}
					type={iconType}
					size={14}
					className="text-[var(--wo-text-muted)] shrink-0"
				/>
			)}
			<input
				type={type}
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				onKeyDown={onEnterKey ? handleKeyDown : undefined}
				disabled={disabled}
				min={min}
				max={max}
				step={step}
				autoFocus={autoFocus}
				className="flex-1 bg-transparent outline-none text-sm text-[var(--wo-text-primary)] placeholder:text-[var(--wo-text-muted)]"
			/>
		</div>
	);
}
