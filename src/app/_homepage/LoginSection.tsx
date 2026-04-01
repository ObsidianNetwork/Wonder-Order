import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import type { ChangeEvent } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import { Avatar, Button, Textfield } from "#components/base";

import { useAdmin } from "#components/context/useContext";

import "./loginSection.scss";

const LoginSection = () => {
	const router = useRouter();
	const session = useSession();
	const { profile: dashboard } = useAdmin();
	const loggedIn = session.status === "authenticated";

	const [busy, setBusy] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [kitchenUsername, setKitchenUsername] = useState("");
	const [showKitchen, setShowKitchen] = useState(false);

	const onLogin = async () => {
		if (!email.trim()) return toast.error("Email is required");
		if (!password.trim()) return toast.error("Password is required");
		setBusy(true);

		// Try restaurant login first
		const restaurantRes = await signIn("restaurant", {
			redirect: false,
			username: email,
			...(showKitchen && { kitchen: kitchenUsername }),
			password,
		});

		if (!restaurantRes?.error) {
			if (kitchenUsername) router.push("/kitchen");
			else router.push("/dashboard");
			return;
		}

		// If restaurant login fails, try platform login
		const platformRes = await signIn("platform", {
			redirect: false,
			email,
			password,
		});

		if (!platformRes?.error) {
			router.push("/platform");
			return;
		}

		toast.error("Invalid credentials");
		setBusy(false);
	};

	if (loggedIn) {
		const role = session.data?.role;
		const displayName = dashboard?.name ?? session.data?.username ?? "User";

		return (
			<section className="loginSection" id="homepage-login">
				<div className="loginBox">
					<div className="loggedInState">
						{dashboard?.avatar && <Avatar src={dashboard.avatar} size="mini" />}
						<div className="loggedInInfo">
							<p className="loggedInName">{displayName}</p>
							<p className="loggedInRole">{role === "platform_admin" ? "Platform Admin" : role === "kitchen" ? "Kitchen Staff" : "Restaurant Admin"}</p>
						</div>
					</div>
					<div className="loggedInActions">
						{role === "platform_admin" && <Button label="Platform Dashboard" onClick={() => router.push("/platform")} />}
						{role === "admin" && <Button label="Dashboard" onClick={() => router.push("/dashboard")} />}
						{(role === "admin" || role === "kitchen") && <Button label="Kitchen" type="secondary" onClick={() => router.push("/kitchen")} />}
						<Button label="Sign Out" type="secondary" onClick={() => router.push("/logout")} />
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="loginSection" id="homepage-login">
			<div className="loginBox">
				<h3 className="loginHeading">Sign In</h3>
				<div className="loginForm">
					<Textfield
						className="loginField"
						icon="f0e0"
						placeholder="Email or username"
						value={email}
						onEnterKey={onLogin}
						onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
					/>
					<Textfield
						className="loginField"
						type="password"
						placeholder="Password"
						value={password}
						onEnterKey={onLogin}
						onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
					/>
					{showKitchen && (
						<Textfield
							className="loginField"
							icon="f86b"
							placeholder="Kitchen username"
							value={kitchenUsername}
							onChange={(e: ChangeEvent<HTMLInputElement>) => setKitchenUsername(e.target.value)}
						/>
					)}
					<div className="loginActions">
						<Button
							className={`kitchenToggle ${showKitchen ? "active" : ""}`}
							type={showKitchen ? "primary" : "secondary"}
							label="Kitchen"
							size="mini"
							onClick={() => setShowKitchen((v) => !v)}
						/>
						<Button label="Sign In" onClick={onLogin} loading={busy} />
					</div>
				</div>
			</div>
		</section>
	);
};

export default LoginSection;
