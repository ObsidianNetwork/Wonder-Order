import noop from "lodash/noop";
import pick from "lodash/pick";
import { useSession } from "next-auth/react";
import { createContext, type ReactNode, useEffect, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";

import type { TMenu } from "#utils/database/models/menu";
import type { TOrder } from "#utils/database/models/order";
import { fetcher } from "#utils/helper/common";

const OrderDefault: TOrderInitialType = {
	order: undefined,
	loading: false,
	placeOrder: () => new Promise(noop),
	placingOrder: false,
	cancelOrder: noop,
	cancelingOrder: false,
	loginOpen: false,
	setLoginOpen: noop,
	// Payment
	paymentRequired: false,
	paymentClientSecret: undefined,
	paymentAmount: 0,
	paymentIntentId: undefined,
	startPayment: () => new Promise(noop),
	confirmPaymentOrder: () => new Promise(noop),
	cancelPayment: noop,
};

export const OrderContext = createContext(OrderDefault);
export const OrderProvider = ({ children }: TOrderProviderProps) => {
	const session = useSession();
	const authenticated = session.status === "authenticated";
	const { data: order, isLoading: loading, mutate } = useSWR(authenticated ? "/api/order" : null, fetcher, { refreshInterval: 5000 });

	const [placingOrder, setPlacingOrder] = useState(false);
	const [cancelingOrder, setCancelingOrder] = useState(false);
	const [loginOpen, setLoginOpen] = useState(false);

	// Payment state
	const [paymentRequired, setPaymentRequired] = useState(false);
	const [paymentClientSecret, setPaymentClientSecret] = useState<string>();
	const [paymentAmount, setPaymentAmount] = useState(0);
	const [paymentIntentId, setPaymentIntentId] = useState<string>();
	const [pendingProducts, setPendingProducts] = useState<TMenuCustom[]>([]);

	const placeOrder = async (products: Array<TMenuCustom>) => {
		setPlacingOrder(true);
		const req = await fetch("/api/order/place", {
			method: "POST",
			body: JSON.stringify({
				products: products.map((product) => pick(product, ["_id", "quantity"])),
			}),
		});
		const res = await req.json();

		if (!req.ok) toast.error(res?.message);
		await mutate();
		setPlacingOrder(false);
	};

	const startPayment = async (products: Array<TMenuCustom>) => {
		setPlacingOrder(true);
		setPendingProducts(products);

		const req = await fetch("/api/payment/create-intent", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				products: products.map((product) => pick(product, ["_id", "quantity"])),
			}),
		});
		const res = await req.json();

		if (!req.ok) {
			toast.error(res?.message);
			setPlacingOrder(false);
			return;
		}

		setPaymentClientSecret(res.clientSecret);
		setPaymentAmount(res.amount);
		setPaymentIntentId(res.paymentIntentId);
		setPlacingOrder(false);
	};

	const confirmPaymentOrder = async () => {
		if (!paymentIntentId || !pendingProducts.length) return;

		setPlacingOrder(true);
		const req = await fetch("/api/payment/confirm-order", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				paymentIntentId,
				products: pendingProducts.map((product) => pick(product, ["_id", "quantity"])),
			}),
		});
		const res = await req.json();

		if (!req.ok) toast.error(res?.message);
		else toast.success("Order placed!");

		// Clear payment state
		setPaymentClientSecret(undefined);
		setPaymentAmount(0);
		setPaymentIntentId(undefined);
		setPendingProducts([]);
		await mutate();
		setPlacingOrder(false);
	};

	const cancelPayment = () => {
		setPaymentClientSecret(undefined);
		setPaymentAmount(0);
		setPaymentIntentId(undefined);
		setPendingProducts([]);
	};

	const cancelOrder = async () => {
		setCancelingOrder(true);
		const req = await fetch("/api/order/cancel", { method: "POST" });
		const res = await req.json();

		if (!req.ok) toast.error(res?.message);
		await mutate();
		setCancelingOrder(false);
	};

	useEffect(() => {
		mutate();
	}, [mutate]);

	return (
		<OrderContext.Provider
			value={{
				order,
				loading,
				placeOrder,
				placingOrder,
				cancelOrder,
				cancelingOrder,
				loginOpen,
				setLoginOpen,
				paymentRequired,
				setPaymentRequired,
				paymentClientSecret,
				paymentAmount,
				paymentIntentId,
				startPayment,
				confirmPaymentOrder,
				cancelPayment,
			}}
		>
			{children}
		</OrderContext.Provider>
	);
};

export type TOrderProviderProps = {
	children?: ReactNode;
};

export type TOrderInitialType = {
	order?: TOrder;
	loading: boolean;
	placeOrder: (products: Array<TMenuCustom>) => Promise<void>;
	placingOrder: boolean;
	cancelOrder: () => void;
	cancelingOrder: boolean;
	loginOpen: boolean;
	setLoginOpen: (open: boolean) => void;
	// Payment
	paymentRequired: boolean;
	setPaymentRequired?: (v: boolean) => void;
	paymentClientSecret?: string;
	paymentAmount: number;
	paymentIntentId?: string;
	startPayment: (products: Array<TMenuCustom>) => Promise<void>;
	confirmPaymentOrder: () => Promise<void>;
	cancelPayment: () => void;
};
type TMenuCustom = TMenu & { quantity: number };
