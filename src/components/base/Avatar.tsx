import clsx from "clsx";

interface AvatarProps {
	src?: string | null;
	size?: "mini" | "default";
	className?: string;
	alt?: string;
}

export function Avatar({ src, size = "default", className, alt = "" }: AvatarProps) {
	const sizeClass = size === "mini" ? "h-8 w-8" : "h-10 w-10";

	if (!src) {
		return (
			<div
				className={clsx(
					"rounded-full bg-[var(--wo-surface-2)] flex items-center justify-center text-[var(--wo-text-muted)]",
					sizeClass,
					className,
				)}
			>
				<svg
					viewBox="0 0 24 24"
					fill="currentColor"
					className="h-1/2 w-1/2"
				>
					<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
				</svg>
			</div>
		);
	}

	return (
		<img
			src={src}
			alt={alt}
			className={clsx("rounded-full object-cover", sizeClass, className)}
		/>
	);
}
