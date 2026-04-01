"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { Button, Textfield } from "#components/base";

import Modal from "#components/layout/Modal";
import type { TMenu } from "#utils/database/models/menu";

import "./menuItemModal.scss";

const vegOptions = ["veg", "non-veg", "contains-egg"] as const;
const foodTypeOptions = ["", "spicy", "extra-spicy", "sweet"] as const;

const MenuItemModal = ({ open, setOpen, item, categories, onSaved }: MenuItemModalProps) => {
	const isEdit = !!item;
	const [busy, setBusy] = useState(false);

	const [name, setName] = useState(item?.name ?? "");
	const [description, setDescription] = useState(item?.description ?? "");
	const [category, setCategory] = useState(item?.category ?? categories[0] ?? "");
	const [price, setPrice] = useState(item?.price?.toString() ?? "");
	const [taxPercent, setTaxPercent] = useState(item?.taxPercent?.toString() ?? "10");
	const [foodType, setFoodType] = useState(item?.foodType ?? "");
	const [veg, setVeg] = useState<string>(item?.veg ?? "veg");
	const [image, setImage] = useState(item?.image ?? "");
	const [hidden, setHidden] = useState(item?.hidden ?? true);

	const onSubmit = async () => {
		if (!name.trim()) return toast.error("Name is required");
		if (!price || Number.isNaN(Number(price))) return toast.error("Valid price is required");
		if (!veg) return toast.error("Veg/Non-veg is required");

		setBusy(true);

		const body = {
			...(isEdit && { itemId: item._id.toString() }),
			name: name.trim(),
			description: description.trim(),
			category,
			price: Number(price),
			taxPercent: Number(taxPercent) || 0,
			foodType: foodType || undefined,
			veg,
			image: image.trim(),
			hidden,
		};

		const res = await fetch("/api/admin/menu", {
			method: isEdit ? "PATCH" : "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});

		const data = await res.json();
		setBusy(false);

		if (!res.ok) {
			toast.error(data.message || "Failed to save");
			return;
		}

		toast.success(isEdit ? "Item updated" : "Item added");
		onSaved();
		setOpen(false);
	};

	return (
		<Modal open={open} setOpen={setOpen}>
			<div className="menuItemModal">
				<h3>{isEdit ? "Edit" : "Add"} Menu Item</h3>

				<div className="formGrid">
					<div className="formField full">
						<span>Name</span>
						<Textfield value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} placeholder="Item name" />
					</div>

					<div className="formField full">
						<span>Description</span>
						<Textfield
							value={description}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
							placeholder="Short description"
						/>
					</div>

					<div className="formField">
						<span>Category</span>
						<select value={category} onChange={(e) => setCategory(e.target.value)}>
							{categories.map((c) => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
						</select>
					</div>

					<div className="formField">
						<span>Dietary</span>
						<select value={veg} onChange={(e) => setVeg(e.target.value)}>
							{vegOptions.map((v) => (
								<option key={v} value={v}>
									{v.replace(/-/g, " ")}
								</option>
							))}
						</select>
					</div>

					<div className="formField">
						<span>Price ($)</span>
						<Textfield type="number" value={price} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)} placeholder="0.00" />
					</div>

					<div className="formField">
						<span>Tax %</span>
						<Textfield
							type="number"
							value={taxPercent}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTaxPercent(e.target.value)}
							placeholder="10"
						/>
					</div>

					<div className="formField">
						<span>Food Type</span>
						<select value={foodType} onChange={(e) => setFoodType(e.target.value)}>
							{foodTypeOptions.map((f) => (
								<option key={f} value={f}>
									{f ? f.replace(/-/g, " ") : "None"}
								</option>
							))}
						</select>
					</div>

					<div className="formField">
						<span>Visibility</span>
						<select value={hidden ? "hidden" : "visible"} onChange={(e) => setHidden(e.target.value === "hidden")}>
							<option value="visible">Visible</option>
							<option value="hidden">Hidden</option>
						</select>
					</div>

					<div className="formField full">
						<span>Image URL</span>
						<Textfield value={image} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImage(e.target.value)} placeholder="https://..." />
					</div>
				</div>

				<div className="modalActions">
					<Button type="secondary" label="Cancel" size="mini" onClick={() => setOpen(false)} />
					<Button label={isEdit ? "Save" : "Add Item"} size="mini" onClick={onSubmit} loading={busy} />
				</div>
			</div>
		</Modal>
	);
};

export default MenuItemModal;

type MenuItemModalProps = {
	open: boolean;
	setOpen: (open: boolean) => void;
	item?: TMenu;
	categories: string[];
	onSaved: () => void;
};
