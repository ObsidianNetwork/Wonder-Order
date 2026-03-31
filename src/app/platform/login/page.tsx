"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function PlatformLogin() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [busy, setBusy] = useState(false);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setBusy(true);
		setError("");

		const res = await signIn("platform", { redirect: false, email, password });

		if (res?.error) {
			setError(res.error);
			setBusy(false);
		} else {
			router.push("/platform");
		}
	};

	return (
		<div className="loginPage">
			<div className="loginCard">
				<div className="loginHeader">
					<div className="loginMark" />
					<h2>Wonder-Order</h2>
					<p>Platform Administration</p>
				</div>
				<form onSubmit={onSubmit}>
					<input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
					<input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
					{error && <p className="loginError">{error}</p>}
					<button type="submit" className="loginBtn" disabled={busy}>
						{busy ? "Signing in..." : "Sign In"}
					</button>
				</form>
			</div>
		</div>
	);
}
