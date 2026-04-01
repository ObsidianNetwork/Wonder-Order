import clsx from "clsx";

interface SpinnerProps {
	fullpage?: boolean;
	label?: string;
	className?: string;
}

export function Spinner({ fullpage, label, className }: SpinnerProps) {
	const spinner = (
		<div className={clsx("flex flex-col items-center justify-center gap-3", fullpage && "fixed inset-0 z-50 bg-[var(--wo-surface-0)]", className)}>
			<div className="h-6 w-6 rounded-full border-2 border-[var(--wo-surface-border)] border-t-[hsl(var(--colorBrandPrimary))] animate-spin" />
			{label && (
				<span className="text-sm text-[var(--wo-text-secondary)]">
					{label}
				</span>
			)}
		</div>
	);

	return spinner;
}
