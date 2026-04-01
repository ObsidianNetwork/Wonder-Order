"use client";

import { useState } from "react";

import clsx from "clsx";
import { toast } from "react-toastify";

import { Button } from "#components/base/Button";
import { Spinner } from "#components/base/Spinner";
import { useTheme } from "#components/base/theme";
import { themes, type WonderTheme } from "#components/base/theme";
import { useAdmin } from "#components/context/useContext";

import "./themeSettings.scss";

function ThemeCard({ theme, active, onClick }: { theme: WonderTheme; active: boolean; onClick: () => void }) {
	const brandHsl = `hsl(${theme.brand.h}, ${theme.brand.s}%, ${theme.brand.l}%)`;
	const { s0, s1, border } = theme.surfaces.dark;

	return (
		<button
			type="button"
			onClick={onClick}
			className={clsx(
				"themeCard",
				active && "active",
			)}
			style={{ "--card-brand": brandHsl, "--card-s0": s0, "--card-s1": s1, "--card-border": border } as React.CSSProperties}
		>
			<div className="preview">
				<div className="previewBar" />
				<div className="previewDots">
					<span className="dot" />
					<span className="dot" />
					<span className="dot" />
				</div>
			</div>
			<div className="cardInfo">
				<span className="cardName">{theme.name}</span>
				<span className="cardDesc">{theme.description}</span>
			</div>
		</button>
	);
}

const ThemeSettings = () => {
	const { profile, profileMutate } = useAdmin();
	const { themeColor, setThemeColor } = useTheme();
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const currentId = selectedId ?? findCurrentTheme(profile?.themeColor);
	const hasChanges = selectedId !== null && selectedId !== findCurrentTheme(profile?.themeColor);

	const onSelect = (id: string) => {
		setSelectedId(id);
		const theme = themes[id];
		if (theme) setThemeColor(theme.brand);
	};

	const onClear = () => {
		setSelectedId(null);
		if (profile?.themeColor) setThemeColor(profile.themeColor);
	};

	const onSave = async () => {
		if (!selectedId) return;
		setLoading(true);
		const theme = themes[selectedId];
		const req = await fetch("/api/admin/theme", {
			method: "POST",
			body: JSON.stringify({ themeColor: theme.brand, themeId: selectedId }),
		});
		const res = await req.json();
		if (res?.status !== 200) toast.error(res?.message);
		else toast.success("Theme applied");
		await profileMutate();
		setSelectedId(null);
		setLoading(false);
	};

	return (
		<div className="themeSettings">
			<div className="colorHeader">
				<h1 className="heading">
					Theme
				</h1>
				{hasChanges && (
					<div className="action">
						<Button type="secondaryDanger" icon="f00d" iconType="solid" size="mini" disabled={loading} onClick={onClear} />
						<Button icon="f00c" iconType="solid" label="Apply" size="mini" loading={loading} onClick={onSave} />
					</div>
				)}
			</div>
			{loading ? (
				<Spinner className="mt-8 mb-8" label="Applying theme" />
			) : (
				<div className="themeGrid">
					{Object.values(themes).map((theme) => (
						<ThemeCard key={theme.id} theme={theme} active={currentId === theme.id} onClick={() => onSelect(theme.id)} />
					))}
				</div>
			)}
		</div>
	);
};

/** Match a themeColor to a theme ID by comparing brand HSL */
function findCurrentTheme(color?: { h: number; s: number; l: number }): string {
	if (!color) return "midnight";
	for (const [id, theme] of Object.entries(themes)) {
		if (theme.brand.h === color.h && theme.brand.s === color.s && theme.brand.l === color.l) return id;
	}
	return "midnight";
}

export default ThemeSettings;
