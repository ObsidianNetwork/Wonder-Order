"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

interface Client {
	clientId: string;
	name: string;
	slug: string;
	email: string;
	abn: string;
	status: string;
	createdAt: string;
}

export default function PlatformDashboard() {
	const router = useRouter();
	const [clients, setClients] = useState<Client[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch("/api/platform/clients")
			.then((res) => res.json())
			.then((data) => {
				setClients(Array.isArray(data) ? data : []);
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, []);

	const stats = {
		total: clients.length,
		active: clients.filter((c) => c.status === "active").length,
		trial: clients.filter((c) => c.status === "trial").length,
		suspended: clients.filter((c) => c.status === "suspended" || c.status === "cancelled").length,
	};

	return (
		<>
			<nav className="platformNav">
				<div className="navBrand">
					<div className="brandMark" />
					<h1>
						Wonder-Order <span>Platform</span>
					</h1>
				</div>
				<div className="navActions">
					<button type="button" className="btnPrimary" onClick={() => router.push("/platform/clients/new")}>
						New Client
					</button>
					<button type="button" className="btnGhost" onClick={() => signOut({ callbackUrl: "/platform/login" })}>
						Sign Out
					</button>
				</div>
			</nav>

			<div className="platformBody">
				<div className="pageContainer">
					<div className="statsRow">
						<div className="statCard">
							<div className="statLabel">Total Clients</div>
							<div className="statValue">{stats.total}</div>
						</div>
						<div className="statCard">
							<div className="statLabel">Active</div>
							<div className="statValue">{stats.active}</div>
						</div>
						<div className="statCard">
							<div className="statLabel">Trial</div>
							<div className="statValue">{stats.trial}</div>
						</div>
						<div className="statCard">
							<div className="statLabel">Inactive</div>
							<div className="statValue">{stats.suspended}</div>
						</div>
					</div>

					<div className="sectionHeader">
						<h2>Clients</h2>
					</div>

					{loading ? (
						<p style={{ opacity: 0.5 }}>Loading...</p>
					) : (
						<table className="clientTable">
							<thead>
								<tr>
									<th>Name</th>
									<th>Slug</th>
									<th>Client ID</th>
									<th>Email</th>
									<th>Status</th>
									<th>Created</th>
								</tr>
							</thead>
							<tbody>
								{clients.length === 0 ? (
									<tr className="emptyRow">
										<td colSpan={6}>No clients yet. Create your first one.</td>
									</tr>
								) : (
									clients.map((client) => (
										<tr key={client.clientId} onClick={() => router.push(`/platform/clients/${client.clientId}`)}>
											<td className="clientName">{client.name}</td>
											<td className="clientSlug">/{client.slug}</td>
											<td className="clientId">{client.clientId}</td>
											<td>{client.email}</td>
											<td>
												<span className={`badge ${client.status}`}>{client.status}</span>
											</td>
											<td style={{ opacity: 0.5 }}>{new Date(client.createdAt).toLocaleDateString()}</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					)}
				</div>
			</div>
		</>
	);
}
