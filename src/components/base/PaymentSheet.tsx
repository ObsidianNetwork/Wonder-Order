"use client";

import { PaymentElement, Elements, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";
import { Button } from "./Button";
import { Spinner } from "./Spinner";

import "./paymentSheet.scss";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

interface PaymentSheetProps {
	clientSecret: string;
	amount: number;
	onSuccess: () => void;
	onCancel: () => void;
}

function PaymentForm({ amount, onSuccess, onCancel }: Omit<PaymentSheetProps, "clientSecret">) {
	const stripe = useStripe();
	const elements = useElements();
	const [processing, setProcessing] = useState(false);
	const [error, setError] = useState<string>();

	const handleSubmit = async () => {
		if (!stripe || !elements) return;

		setProcessing(true);
		setError(undefined);

		const result = await stripe.confirmPayment({
			elements,
			redirect: "if_required",
		});

		if (result.error) {
			setError(result.error.message);
			setProcessing(false);
		} else if (result.paymentIntent?.status === "succeeded") {
			onSuccess();
		}
	};

	const displayAmount = (amount / 100).toFixed(2);

	return (
		<div className="paymentForm">
			<div className="paymentHeader">
				<h3>Payment</h3>
				<span className="paymentAmount">${displayAmount}</span>
			</div>
			<PaymentElement />
			{error && <p className="paymentError">{error}</p>}
			<div className="paymentActions">
				<Button type="secondary" label="Cancel" size="mini" onClick={onCancel} disabled={processing} />
				<Button label={`Pay $${displayAmount}`} size="mini" onClick={handleSubmit} loading={processing} disabled={!stripe} />
			</div>
		</div>
	);
}

export function PaymentSheet({ clientSecret, amount, onSuccess, onCancel }: PaymentSheetProps) {
	if (!clientSecret) return <Spinner label="Preparing payment..." />;

	return (
		<div className="paymentSheetBackdrop" onClick={onCancel}>
			<div className="paymentSheet" onClick={(e) => e.stopPropagation()}>
				<Elements
					stripe={stripePromise}
					options={{
						clientSecret,
						appearance: {
							theme: "night",
							variables: {
								colorPrimary: "hsl(280, 40%, 55%)",
								borderRadius: "12px",
								fontFamily: "inherit",
							},
						},
					}}
				>
					<PaymentForm amount={amount} onSuccess={onSuccess} onCancel={onCancel} />
				</Elements>
			</div>
		</div>
	);
}
