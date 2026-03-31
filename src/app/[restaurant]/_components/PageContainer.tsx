"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { useQueryParams } from "#utils/hooks/useQueryParams";

import RestaurantHome from "./Home/RestaurantHome";
import OrderPage from "./Menu/OrderPage";

export default function PageContainer() {
	const searchParams = useSearchParams();
	const params = useQueryParams();
	const tab = searchParams.get("tab");
	const table = searchParams.get("table");
	const hasAutoSwitched = useRef(false);

	// On first load with ?table=X but no tab, auto-switch to menu once
	useEffect(() => {
		if (table && !tab && !hasAutoSwitched.current) {
			hasAutoSwitched.current = true;
			params.set({ tab: "menu" });
		}
	}, [table, tab, params]);

	const showMenu = tab === "menu";
	const showHome = !showMenu;

	return (
		<div className="pageContainer">
			{showMenu && <OrderPage />}
			{showHome && <RestaurantHome />}
		</div>
	);
}
