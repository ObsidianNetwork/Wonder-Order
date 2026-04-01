"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface ClientDetail {
	clientId: string;
	name: string;
	slug: string;
	email: string;
	abn: string;
	status: string;
	databaseName: string;
	createdAt: string;
	theme: Record<string, unknown>;
	features: Record<string, boolean>;
	stripeAccountId?: string;
	stripeOnboarded?: boolean;
}

const featureLabels: Record<string, string> = {
	aiChat: "AI Chat Assistant",
	qrScanning: "QR Code Scanning",
	kitchenDashboard: "Kitchen Dashboard",
	onlinePayment: "Online Payment",
	orderHistory: "Order History",
};

export default function ClientDetailPage() {
	const router = useRouter();
	const { clientId } = useParams<{ clientId: string }>();
	const [client, setClient] = useState<ClientDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [busy, setBusy] = useState(false);
	const [newPassword, setNewPassword] = useState("");
	const [pwMsg, setPwMsg] = useState("");
	const [showDelete, setShowDelete] = useState(false);
	const [deleting, setDeleting] = useState(false);

	const fetchClient = useCallback(() => {
		fetch(`/api/platform/clients/${clientId}`)
			.then((res) => res.json())
			.then((data) => {
				setClient(data);
				setLoading(false);
			});
	}, [clientId]);

	useEffect(fetchClient, [fetchClient]);

	const updateStatus = async (status: string) => {
		setBusy(true);
		await fetch(`/api/platform/clients/${clientId}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ status }),
		});
		fetchClient();
		setBusy(false);
	};

	const toggleFeature = async (key: string, value: boolean) => {
		await fetch(`/api/platform/clients/${clientId}/features`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ [key]: value }),
		});
		fetchClient();
	};

	const resetPassword = async () => {
		setPwMsg("");
		const res = await fetch(`/api/platform/clients/${clientId}/reset-password`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ newPassword }),
		});
		const data = await res.json();
		setPwMsg(res.ok ? "Password reset successfully" : data.message);
		if (res.ok) setNewPassword("");
	};

	const deleteClient = async () => {
		setDeleting(true);
		await fetch(`/api/platform/clients/${clientId}`, { method: "DELETE" });
		router.push("/platform");
	};

	if (loading)
		return (
			<div className="platformBody" style={{ display: "flex", justifyContent: "center", paddingTop: "4rem", opacity: 0.5 }}>
				Loading...
			</div>
		);
	if (!client)
		return (
			<div className="platformBody" style={{ display: "flex", justifyContent: "center", paddingTop: "4rem", opacity: 0.5 }}>
				Client not found
			</div>
		);

	return (
		<>
			<nav className="platformNav">
				<div className="navBrand">
					<div className="brandMark" />
					<h1>
						{client.name} <span>{client.clientId}</span>
					</h1>
				</div>
				<div className="navActions">
					<button type="button" className="btnGhost" style={{ color: "#f87171", borderColor: "#ef444440" }} onClick={() => setShowDelete(true)}>
						Delete
					</button>
					<button type="button" className="btnGhost" onClick={() => router.push("/platform")}>
						Back
					</button>
				</div>
			</nav>

			<div className="platformBody">
				<div className="pageContainer">
					<div className="detailGrid">
						<div className="detailCard">
							<h3>Client Details</h3>
							<div className="fieldList">
								<div className="field">
									<span className="fieldLabel">Client ID</span>
									<span className="fieldValue mono">{client.clientId}</span>
								</div>
								<div className="field">
									<span className="fieldLabel">URL Slug</span>
									<span className="fieldValue mono">/{client.slug}</span>
								</div>
								<div className="field">
									<span className="fieldLabel">Email</span>
									<span className="fieldValue">{client.email}</span>
								</div>
								<div className="field">
									<span className="fieldLabel">ABN</span>
									<span className="fieldValue">{client.abn || "Not set"}</span>
								</div>
								<div className="field">
									<span className="fieldLabel">Database</span>
									<span className="fieldValue mono">{client.databaseName}</span>
								</div>
								<div className="field">
									<span className="fieldLabel">Status</span>
									<span className={`badge ${client.status}`}>{client.status}</span>
								</div>
								<div className="field">
									<span className="fieldLabel">Created</span>
									<span className="fieldValue">
										{new Date(client.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
									</span>
								</div>
							</div>
							<div className="actionRow">
								{client.status !== "active" && (
									<button type="button" className="activate" disabled={busy} onClick={() => updateStatus("active")}>
										Activate
									</button>
								)}
								{client.status !== "suspended" && (
									<button type="button" className="suspend" disabled={busy} onClick={() => updateStatus("suspended")}>
										Suspend
									</button>
								)}
								{client.status !== "cancelled" && (
									<button type="button" className="cancel" disabled={busy} onClick={() => updateStatus("cancelled")}>
										Cancel
									</button>
								)}
							</div>
						</div>

						<div className="detailCard">
							<h3>Feature Flags</h3>
							<div className="flagList">
								{client.features &&
									Object.entries(client.features)
										.filter(([key]) => featureLabels[key])
										.map(([key, value]) => (
											<div key={key} className="flagItem">
												<span className="flagLabel">{featureLabels[key]}</span>
												<div className={`toggle ${value ? "on" : ""}`} onClick={() => toggleFeature(key, !value)} />
											</div>
										))}
							</div>
						</div>

						<div className="detailCard">
							<h3>Reset Admin Password</h3>
							<div className="passwordReset">
								<input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} />
								<button type="button" disabled={newPassword.length < 6} onClick={resetPassword}>
									Reset
								</button>
								{pwMsg && <span className="msg">{pwMsg}</span>}
							</div>
						</div>

						<div className="detailCard">
							<h3>Quick Links</h3>
							<div className="fieldList">
								<div className="field">
									<span className="fieldLabel">Restaurant Page</span>
									<a href={`/${client.slug}`} target="_blank" rel="noreferrer" className="fieldValue" style={{ color: "#818cf8" }}>
										/{client.slug}
									</a>
								</div>
								<div className="field">
									<span className="fieldLabel">Admin Login</span>
									<span className="fieldValue mono">{client.email}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{showDelete && (
				<div className="deleteOverlay" onClick={() => !deleting && setShowDelete(false)}>
					<div className="deleteCard" onClick={(e) => e.stopPropagation()}>
						<h3>Delete {client.name}?</h3>
						<p>This will permanently delete the client, their database, and all associated data. This cannot be undone.</p>
						<div className="deleteActions">
							<button type="button" className="confirmDelete" disabled={deleting} onClick={deleteClient}>
								{deleting ? "Deleting..." : "Delete Permanently"}
							</button>
							<button type="button" className="cancelDelete" onClick={() => setShowDelete(false)}>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
