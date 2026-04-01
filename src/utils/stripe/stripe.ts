import Stripe from "stripe";

let _stripe: Stripe | undefined;

export function getStripe(): Stripe {
	if (!_stripe) {
		const key = process.env.STRIPE_SECRET_KEY;
		if (!key) throw new Error("STRIPE_SECRET_KEY environment variable is required");
		_stripe = new Stripe(key);
	}
	return _stripe;
}

/** Lazy proxy — avoids crashing at import time when env vars aren't set (build time) */
export const stripe = new Proxy({} as Stripe, {
	get(_, prop) {
		// biome-ignore lint/suspicious/noExplicitAny: Proxy needs dynamic access
		return (getStripe() as any)[prop];
	},
});

export const PLATFORM_FEE_PERCENT = Number(process.env.STRIPE_PLATFORM_FEE_PERCENT ?? "5");
