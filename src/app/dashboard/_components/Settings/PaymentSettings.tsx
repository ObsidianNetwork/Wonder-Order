"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { Button } from "#components/base/Button";
import { Spinner } from "#components/base/Spinner";
import { useAdmin } from "#components/context/useContext";

import "./paymentSettings.scss";

const PaymentSettings = () => {
	const { profile, profileMutate } = useAdmin();
	const [stripeStatus, setStripeStatus] = useState<{ connected: boolean; onboarded: boolean } | null>(null);
	const [loading, setLoading] = useState(true);
	const [connecting, setConnecting] = useState(false);

	const fetchStatus = async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/payment/connect/status");
			const data = await res.json();
			setStripeStatus(data);
		} catch {
			setStripeStatus({ connected: false, onboarded: false });
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchStatus();
	}, []);

	const onConnect = async () => {
		setConnecting(true);
		const res = await fetch("/api/payment/connect", { method: "POST" });
		const data = await res.json();
		setConnecting(false);

		if (data.url) {
			window.location.href = data.url;
		} else {
			toast.error(data.message ?? "Failed to start Stripe onboarding");
		}
	};

	const togglePaymentMode = async () => {
		if (!stripeStatus?.onboarded) {
			toast.error("Connect Stripe first before enabling payments");
			return;
		}

		const newMode = profile?.paymentMode === "pay_first" ? "disabled" : "pay_first";
		await fetch("/api/admin/profile", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ paymentMode: newMode }),
		});
		await profileMutate();
		toast.success(newMode === "pay_first" ? "Payments enabled" : "Payments disabled");
	};

	return (
		<div className="paymentSettings">
			<h1 className="heading">Payments</h1>

			{loading ? (
				<Spinner className="paymentSpinner" label="Checking payment status..." />
			) : (
				<>
					<div className="stripeStatusCard">
						<div className="statusRow">
							<div className="statusInfo">
								<span className="statusLabel">Stripe Account</span>
								<span className="statusDesc">
									{stripeStatus?.onboarded
										? "Connected and ready to accept payments"
										: stripeStatus?.connected
											? "Onboarding incomplete — finish setup to accept payments"
											: "Connect your Stripe account to accept online payments from customers"}
								</span>
							</div>
							<div className={`statusBadge ${stripeStatus?.onboarded ? "active" : stripeStatus?.connected ? "pending" : "inactive"}`}>
								{stripeStatus?.onboarded ? "Active" : stripeStatus?.connected ? "Pending" : "Not connected"}
							</div>
						</div>
						{!stripeStatus?.onboarded && (
							<Button
								label={stripeStatus?.connected ? "Continue Setup" : "Connect Stripe"}
								onClick={onConnect}
								loading={connecting}
							/>
						)}
					</div>

					<div className="settingRow">
						<div className="settingInfo">
							<span className="settingLabel">Require Payment to Order</span>
							<span className="settingDesc">Customers must pay before their order is sent to the kitchen</span>
						</div>
						<button
							type="button"
							className={`toggle ${profile?.paymentMode === "pay_first" ? "on" : ""}`}
							onClick={togglePaymentMode}
						/>
					</div>
				</>
			)}
		</div>
	);
};

export default PaymentSettings;
