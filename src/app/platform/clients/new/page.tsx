"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewClient() {
	const router = useRouter();
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setBusy(true);
		setError("");
		setSuccess("");

		const form = new FormData(e.currentTarget);
		const body = {
			name: form.get("name"),
			slug: form.get("slug"),
			abn: form.get("abn") || undefined,
			email: form.get("email"),
			adminPassword: form.get("adminPassword"),
		};

		const res = await fetch("/api/platform/clients", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});

		const data = await res.json();
		setBusy(false);

		if (!res.ok) {
			setError(data.message || "Failed to create client");
		} else {
			setSuccess(`Client ${data.clientId} created successfully`);
			setTimeout(() => router.push(`/platform/clients/${data.clientId}`), 1500);
		}
	};

	return (
		<>
			<nav className="platformNav">
				<div className="navBrand">
					<div className="brandMark" />
					<h1>
						New <span>Client</span>
					</h1>
				</div>
				<div className="navActions">
					<button type="button" className="btnGhost" onClick={() => router.push("/platform")}>
						Back
					</button>
				</div>
			</nav>

			<div className="platformBody">
				<div className="pageContainer">
					<div className="createForm">
						<div className="formCard">
							<form onSubmit={onSubmit}>
								<div className="formFields">
									<div className="formGroup">
										<span className="formLabel">Business Name</span>
										<input name="name" placeholder="Joe's Cafe" required />
									</div>
									<div className="formGroup">
										<span className="formLabel">URL Slug</span>
										<input name="slug" placeholder="joes-cafe" pattern="[a-z0-9-]+" title="Lowercase letters, numbers, and hyphens only" required />
										<span className="formHint">This becomes the restaurant URL: /joes-cafe</span>
									</div>
									<div className="formGroup">
										<span className="formLabel">ABN</span>
										<input name="abn" placeholder="12345678901" pattern="\d{11}" title="Must be 11 digits" />
										<span className="formHint">Optional - Australian Business Number</span>
									</div>
									<div className="formGroup">
										<span className="formLabel">Admin Email</span>
										<input name="email" type="email" placeholder="owner@restaurant.com" required />
									</div>
									<div className="formGroup">
										<span className="formLabel">Admin Password</span>
										<input name="adminPassword" type="password" placeholder="Minimum 6 characters" required minLength={6} />
									</div>
								</div>

								{error && <div className="formMsg error">{error}</div>}
								{success && <div className="formMsg success">{success}</div>}

								<div className="formActions">
									<button type="submit" className="createBtn" disabled={busy}>
										{busy ? "Provisioning..." : "Create Client"}
									</button>
									<button type="button" className="cancelBtn" onClick={() => router.push("/platform")}>
										Cancel
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
