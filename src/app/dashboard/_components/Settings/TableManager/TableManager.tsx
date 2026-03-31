"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button, Spinner } from "xtreme-ui";

import { useAdmin } from "#components/context/useContext";

import "./tableManager.scss";

const TableManager = () => {
	const { tables, profileLoading, profileMutate, profile } = useAdmin();
	const [count, setCount] = useState(tables.length);
	const [saving, setSaving] = useState(false);
	const hasChanges = count !== tables.length;
	const slug = profile?.restaurantID ?? "";
	const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

	useEffect(() => {
		setCount(tables.length);
	}, [tables.length]);

	const onSave = async () => {
		setSaving(true);
		const res = await fetch("/api/admin/table", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ count }),
		});
		setSaving(false);
		if (!res.ok) return toast.error("Failed to update tables");
		toast.success(`Tables updated to ${count}`);
		await profileMutate();
	};

	if (profileLoading) return <Spinner fullpage label="Loading Tables..." />;

	return (
		<div className="tableManager">
			<div className="tableHeader">
				<h1>Tables</h1>
			</div>

			<div className="tableSlider">
				<div className="sliderRow">
					<span className="sliderLabel">Number of tables</span>
					<div className="sliderControl">
						<input type="range" min={0} max={50} value={count} onChange={(e) => setCount(Number(e.target.value))} />
						<span className="sliderValue">{count}</span>
					</div>
				</div>
				{hasChanges && (
					<div className="sliderActions">
						<Button size="mini" label={`Set to ${count} tables`} onClick={onSave} loading={saving} />
						<Button size="mini" type="secondary" label="Reset" onClick={() => setCount(tables.length)} />
					</div>
				)}
			</div>

			{tables.length > 0 && (
				<div className="tableGrid">
					{tables.map((table) => {
						const tableNum = table.username || table.name;
						const qrUrl = `${siteUrl}/${slug}?table=${tableNum}`;
						const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`;

						return (
							<div key={tableNum} className="tableQRCard">
								<div className="qrCode">
									{/* biome-ignore lint/performance/noImgElement: External QR API */}
									<img src={qrImage} alt={`Table ${tableNum} QR`} width={140} height={140} />
								</div>
								<div className="qrInfo">
									<span className="qrTableName">Table {tableNum}</span>
									<span className="qrUrl">
										/{slug}?table={tableNum}
									</span>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default TableManager;
