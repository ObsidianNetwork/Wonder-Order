import { signOut, useSession } from "next-auth/react";
import { type UIEvent, useEffect, useMemo, useRef, useState } from "react";
import { ActionCard, Button, Spinner } from "xtreme-ui";

import SearchButton from "#components/base/SearchButton";
import SideSheet from "#components/base/SideSheet";
import { useOrder, useRestaurant } from "#components/context/useContext";
import Modal from "#components/layout/Modal";
import type { TMenu } from "#utils/database/models/menu";
import { useQueryParams } from "#utils/hooks/useQueryParams";

import CartPage from "./CartPage";
import MenuCard from "./MenuCard";
import UserLogin from "./UserLogin";
import "./orderPage.scss";

const OrderPage = () => {
	const session = useSession();
	const { loading, loginOpen, setLoginOpen } = useOrder();
	const { restaurant } = useRestaurant();

	const menus = restaurant?.menus as Array<TMenuCustom>;
	const params = useQueryParams();
	const table = params.get("table");
	const searchParam = params.get("search")?.trim() ?? "";
	const categoryParam = params.get("category")?.trim();
	const category = useMemo(() => (categoryParam ? categoryParam.split(",") : []), [categoryParam]);

	const order = useRef<HTMLDivElement>(null);
	const [sideSheetOpen, setSideSheetOpen] = useState(false);
	const [topHeading, setTopHeading] = useState(["Menu", "Category"]);
	const [orderHeading, setOrderHeading] = useState(["Explore", "Menu"]);
	const [sideSheetHeading, setSideSheetHeading] = useState(["Your", "Order"]);

	const [searchActive, setSearchActive] = useState(false);
	const [searchValue, setSearchValue] = useState("");
	const [floatHeader, setFloatHeader] = useState(false);
	const [showInfoCard, setShowInfoCard] = useState(false);

	const [filteredProducts, setFilteredProducts] = useState<Array<TMenuCustom>>(menus);
	const [selectedProducts, setSelectedProducts] = useState<Array<TMenuCustom>>([]);
	const [hasImageItems, setHasImageItems] = useState(false);
	const [hasNonImageItems, setHasNonImageItems] = useState(false);

	const showOrderButton = restaurant?.tables?.some(({ username }) => username === table);
	const eligibleToOrder = session.data?.role === "customer" && showOrderButton;

	const onMenuScroll = (event: UIEvent<HTMLDivElement>) => {
		const scrollTop = (event.target as HTMLDivElement).scrollTop;
		if (scrollTop > 30) {
			setFloatHeader(true);
			setTopHeading(["Menu", "Category"]);
			if (order?.current && scrollTop >= order?.current?.offsetTop - 15) setTopHeading(orderHeading);
			return;
		}
		return setFloatHeader(false);
	};
	const onCategoryClick = (categoryName: string) => {
		let newCategory = [];
		if (category.includes(categoryName)) newCategory = category.filter((item) => item !== categoryName);
		else newCategory = [...category, categoryName];

		params.set({ category: newCategory.join(",") });
	};
	const [showTableEntry, setShowTableEntry] = useState(false);
	const [manualTable, setManualTable] = useState("");

	const onLoginClick = () => {
		if (table) return setLoginOpen(true);
		return setShowTableEntry(true);
	};
	const onSetTable = () => {
		if (manualTable.trim()) {
			params.set({ table: manualTable.trim() });
			setShowTableEntry(false);
		}
	};
	const increaseProductQuantity = (product: TMenuCustom) => {
		const selection = [...selectedProducts];
		if (selectedProducts.some((item) => item._id === product._id)) {
			selection.forEach((item) => {
				if (product._id === item._id) item.quantity++;
			});
		} else {
			product.quantity = 1;
			selection.push(product);
		}
		setSelectedProducts(selection);
	};
	const decreaseProductQuantity = (product: TMenuCustom) => {
		let selection = [...selectedProducts];
		selection.forEach((item) => {
			if (product._id === item._id) {
				item.quantity--;
				if (item.quantity === 0) {
					const filter = selection.filter((tempItem) => tempItem._id !== product._id);
					selection = [...filter];
				}
			}
		});
		setSelectedProducts(selection);
	};

	useEffect(() => {
		const search = searchParam.toLowerCase();

		setFilteredProducts(
			menus?.filter?.(
				({ name, description, category: cat }) =>
					(search ? name?.toLowerCase().includes(search) || description?.toLowerCase().includes(search) || cat?.toLowerCase().includes(search) : true) &&
					(category.length ? category.includes(cat) : true),
			),
		);
	}, [category, menus, searchParam]);

	useEffect(() => {
		params.set({ category: category.filter((e) => restaurant?.profile.categories.includes(e)).join(",") });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [category, restaurant, params.set]);
	useEffect(() => {
		params.set({ search: searchValue });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchValue, params.set]);

	useEffect(() => {
		setHasImageItems(filteredProducts?.some((product) => !!product.image) ?? false);
		setHasNonImageItems(filteredProducts?.some((product) => !product.image) ?? false);
	}, [filteredProducts]);

	useEffect(() => {
		if (session.data?.role === "customer") setOrderHeading(["Your", "Order"]);
		else setOrderHeading(["Our", "Menu"]);
	}, [session]);

	useEffect(() => {
		if (session.status === "authenticated" && session.data?.restaurant?.username !== restaurant?.username) signOut();
	}, [restaurant?.username, session.data?.restaurant?.username, session.status]);

	return (
		<div className="orderPage">
			<div className="mainContainer" onScroll={onMenuScroll}>
				<div className={`mainHeader ${searchActive ? "searchActive" : ""} ${floatHeader ? "floatHeader" : ""}`}>
					<h1>
						{topHeading[0]} <span>{topHeading[1]}</span>
					</h1>
					<div className="options">
						<SearchButton setSearchActive={setSearchActive} placeholder="Search menu" value={searchValue} setValue={setSearchValue} />
						{(!session.data?.role || !showOrderButton) && <Button className="loginButton" label="Order" onClick={onLoginClick} />}
						{eligibleToOrder && (
							<Button
								icon="e43b"
								iconType="solid"
								label={`${selectedProducts?.length > 0 ? selectedProducts?.length : ""}`}
								onClick={() => setSideSheetOpen(true)}
							/>
						)}
						{session.data?.role === "admin" && (
							<Button className="dashboardButton" label="Dashboard" icon="e09f" iconType="solid" onClick={() => params.router.push("/dashboard")} />
						)}
						{session.data?.role === "kitchen" && (
							<Button className="kitchenButton" label="Kitchen" icon="e09f" iconType="solid" onClick={() => params.router.push("/kitchen")} />
						)}
					</div>
				</div>
				{restaurant && (
					<div className="category">
						<div className="itemCategories">
							{restaurant?.profile?.categories?.map((item, i) => (
								<ActionCard key={i} className={`menuCategory ${category.includes(item) ? "active" : ""}`} onClick={() => onCategoryClick(item)}>
									<span className="title">{item}</span>
								</ActionCard>
							))}
						</div>
					</div>
				)}
				{!restaurant ? (
					<Spinner label="Loading Menu..." fullpage />
				) : (
					<div className="order" ref={order}>
						<div className="header">
							<h1>
								{orderHeading[0]} <span>{orderHeading[1]}</span>
							</h1>
						</div>
						{hasImageItems && (
							<div className={`itemContainer ${!eligibleToOrder ? "restrictOrder " : ""}`}>
								<div>
									{filteredProducts?.map(
										(item) =>
											!item.hidden && (
												<MenuCard
													key={item._id.toString()}
													item={item}
													restrictOrder={!eligibleToOrder}
													increaseQuantity={increaseProductQuantity}
													decreaseQuantity={decreaseProductQuantity}
													showInfo={item._id.toString() === showInfoCard.toString()}
													setShowInfo={(v) => setShowInfoCard(v)}
													show={!!item.image}
													quantity={
														(selectedProducts.some((obj) => obj._id === item._id) &&
															selectedProducts?.find((obj) => obj._id === item._id)?.quantity) ||
														0
													}
												/>
											),
									)}
								</div>
							</div>
						)}
						{hasImageItems && hasNonImageItems && <hr />}
						{hasNonImageItems && (
							<div className={`itemContainer withoutImage ${!eligibleToOrder ? "restrictOrder " : ""}`}>
								<div>
									{filteredProducts?.map((item) => (
										<MenuCard
											key={item._id.toString()}
											item={item}
											restrictOrder={!eligibleToOrder}
											increaseQuantity={increaseProductQuantity}
											decreaseQuantity={decreaseProductQuantity}
											showInfo={item._id.toString() === showInfoCard.toString()}
											setShowInfo={(v) => setShowInfoCard(v)}
											show={!item.image}
											quantity={
												(selectedProducts.some((obj) => obj._id === item._id) &&
													selectedProducts?.find((obj) => obj._id === item._id)?.quantity) ||
												0
											}
										/>
									))}
								</div>
							</div>
						)}
					</div>
				)}
			</div>
			<SideSheet title={sideSheetHeading} open={sideSheetOpen} setOpen={setSideSheetOpen}>
				{loading ? (
					<Spinner label="Loading Order..." fullpage />
				) : (
					<CartPage
						selectedProducts={selectedProducts}
						increaseProductQuantity={increaseProductQuantity}
						decreaseProductQuantity={decreaseProductQuantity}
						resetSelectedProducts={() => setSelectedProducts([])}
						setSideSheetHeading={setSideSheetHeading}
					/>
				)}
			</SideSheet>
			<Modal open={loginOpen} setOpen={setLoginOpen}>
				<UserLogin setOpen={setLoginOpen} />
			</Modal>
			<Modal open={showTableEntry} setOpen={setShowTableEntry}>
				<div className="tableEntryModal">
					<h3>Select Your Table</h3>
					<p>Enter your table number or scan the QR code on your table</p>
					<div className="tableEntryInput">
						<input
							type="number"
							placeholder="Table number"
							value={manualTable}
							onChange={(e) => setManualTable(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && onSetTable()}
							min={1}
						/>
						<Button label="Go" onClick={onSetTable} />
					</div>
					<div className="tableEntryDivider">
						<span>or</span>
					</div>
					<Button label="Scan QR Code" type="secondary" icon="f029" iconType="solid" onClick={() => params.router.push("/scan")} />
				</div>
			</Modal>
		</div>
	);
};

export default OrderPage;

type TMenuCustom = TMenu & { quantity: number };
