"use client";

import { SessionProvider } from "next-auth/react";
import { type ReactNode, Suspense } from "react";
import { ThemeProvider } from "#components/base/theme";

import { ToastManager } from "#components/base/ToastManager";

import { AdminProvider } from "./Admin";
import { OrderProvider } from "./Order";
import { RestaurantProvider } from "./Restaurant";

export const GlobalProvider = ({ children }: ProviderProps) => {
	return (
		<ThemeProvider>
			<SessionProvider>
				<Suspense>{children}</Suspense>
			</SessionProvider>
		</ThemeProvider>
	);
};

export const CustomerProvider = ({ children }: ProviderProps) => {
	return (
		<RestaurantProvider>
			<ToastManager />
			<OrderProvider>{children}</OrderProvider>
		</RestaurantProvider>
	);
};

export const DashboardProvider = ({ children }: ProviderProps) => {
	return (
		<AdminProvider>
			<ToastManager />
			{children}
		</AdminProvider>
	);
};
interface ProviderProps {
	children?: ReactNode;
}
