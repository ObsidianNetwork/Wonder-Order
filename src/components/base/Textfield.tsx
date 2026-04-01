"use client";

import clsx from "clsx";
import type { ChangeEventHandler, HTMLInputTypeAttribute, KeyboardEvent } from "react";
import { Icon } from "./Icon";
import "./textfield.scss";

interface TextfieldProps {
	id?: string;
	placeholder?: string;
	value?: string | number;
	onChange?: ChangeEventHandler<HTMLInputElement>;
	onEnterKey?: () => void;
	onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
	type?: HTMLInputTypeAttribute;
	icon?: string;
	iconType?: "solid" | "regular";
	disabled?: boolean;
	className?: string;
	autoComplete?: string;
	min?: number;
	max?: number;
	step?: number;
	autoFocus?: boolean;
}

export function Textfield({
	id,
	placeholder,
	value,
	onChange,
	onEnterKey,
	onKeyDown,
	type = "text",
	icon,
	iconType,
	disabled,
	className,
	autoComplete,
	min,
	max,
	step,
	autoFocus,
}: TextfieldProps) {
	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (onKeyDown) onKeyDown(e);
		if (e.key === "Enter" && onEnterKey) onEnterKey();
	};

	return (
		<label
			className={clsx(
				"wo-textfield",
				disabled && "disabled",
				className,
			)}
		>
			{icon && (
				<Icon
					code={icon}
					type={iconType}
					size={14}
					className="wo-textfield-icon"
				/>
			)}
			<input
				id={id}
				type={type}
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				onKeyDown={onEnterKey || onKeyDown ? handleKeyDown : undefined}
				disabled={disabled}
				autoComplete={autoComplete}
				min={min}
				max={max}
				step={step}
				autoFocus={autoFocus}
			/>
		</label>
	);
}
