import { useState } from "react";
import { toast } from "react-toastify";
import { Button, Icon, Spinner, Textfield } from "xtreme-ui";

import { useAdmin } from "#components/context/useContext";
import type { TMenu } from "#utils/database/models/menu";

import MenuEditorItem from "./MenuEditorItem";
import MenuItemModal from "./MenuItemModal";
import "./menuEditor.scss";

const MenuEditor = () => {
	const { profile, menus, profileLoading, profileMutate } = useAdmin();
	const [hideSettingsLoading, setHideSettingsLoading] = useState<string[]>([]);
	const [category, setCategory] = useState(0);
	const [modalOpen, setModalOpen] = useState(false);
	const [editItem, setEditItem] = useState<TMenu | undefined>();
	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
	const [deleteLoading, setDeleteLoading] = useState(false);

	const [showAddCategory, setShowAddCategory] = useState(false);
	const [newCategory, setNewCategory] = useState("");
	const [categoryLoading, setCategoryLoading] = useState(false);

	const currentCategory = profile?.categories?.[category] ?? "";
	const filteredMenus = menus.filter((item) => item.category === currentCategory);

	const onAddCategory = async () => {
		if (!newCategory.trim()) return;
		setCategoryLoading(true);
		const res = await fetch("/api/admin/category", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ category: newCategory.trim() }),
		});
		const data = await res.json();
		setCategoryLoading(false);
		if (!res.ok) return toast.error(data.message);
		toast.success("Category added");
		setNewCategory("");
		setShowAddCategory(false);
		await profileMutate();
	};

	const onDeleteCategory = async (cat: string) => {
		setCategoryLoading(true);
		const res = await fetch("/api/admin/category", {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ category: cat }),
		});
		setCategoryLoading(false);
		if (!res.ok) return toast.error("Failed to delete category");
		toast.success("Category removed");
		setCategory(0);
		await profileMutate();
	};

	const onHide = async (itemId: string, hidden: boolean) => {
		setHideSettingsLoading((v) => [...v, itemId]);
		const req = await fetch("/api/admin/menu/hidden", {
			method: "POST",
			body: JSON.stringify({ itemId, hidden }),
		});
		const res = await req.json();
		if (res?.status !== 200) toast.error(res?.message);
		await profileMutate();
		setHideSettingsLoading((v) => v.filter((item) => item !== itemId));
	};

	const onEdit = (item: TMenu) => {
		setEditItem(item);
		setModalOpen(true);
	};

	const onAdd = () => {
		setEditItem(undefined);
		setModalOpen(true);
	};

	const onDelete = async (itemId: string) => {
		setDeleteLoading(true);
		const res = await fetch("/api/admin/menu", {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ itemId }),
		});
		setDeleteLoading(false);
		setDeleteConfirm(null);
		if (!res.ok) return toast.error("Failed to delete item");
		toast.success("Item deleted");
		await profileMutate();
	};

	if (profileLoading) return <Spinner fullpage label="Loading Menu..." />;

	return (
		<div className="menuEditor">
			<div className="menuCategoryEditor">
				<div className="menuCategoryHeader">
					<h1 className="menuCategoryHeading">Menu Categories</h1>
					<div className="menuCategoryOptions">
						{showAddCategory ? (
							<div className="addCategoryForm">
								<Textfield
									className="categoryInput"
									placeholder="Category name"
									value={newCategory}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategory(e.target.value)}
									onEnterKey={onAddCategory}
								/>
								<Button size="mini" icon="f00c" iconType="solid" onClick={onAddCategory} loading={categoryLoading} />
								<Button size="mini" type="secondary" icon="f00d" iconType="solid" onClick={() => setShowAddCategory(false)} />
							</div>
						) : (
							<Button size="mini" label="Add Category" icon="2b" iconType="solid" onClick={() => setShowAddCategory(true)} />
						)}
					</div>
				</div>
				<div className="menuCategoryContainer">
					{profile?.categories?.map((item, i) => (
						<div key={item} className={`menuCategory ${category === i ? "active" : ""}`} onClick={() => setCategory(i)}>
							<span className="title">{item}</span>
							<span
								className="deleteCategory"
								onClick={(e) => {
									e.stopPropagation();
									onDeleteCategory(item);
								}}>
								<Icon code="f00d" type="solid" size={10} />
							</span>
						</div>
					))}
				</div>
			</div>
			<div className="menuItemEditor">
				<div className="menuItemHeader">
					<h1 className="menuItemHeading">
						{currentCategory ? currentCategory : "Menu"} ({filteredMenus.length})
					</h1>
					<div className="menuItemOptions">
						<Button size="mini" label="Add Item" icon="2b" iconType="solid" onClick={onAdd} />
					</div>
				</div>
				<div className="menuItemContainer">
					{filteredMenus.length === 0 ? (
						<p className="emptyMessage">No items in this category yet.</p>
					) : (
						filteredMenus.map((item) => (
							<div key={item._id.toString()} className="menuItemRow">
								<MenuEditorItem item={item} onEdit={onEdit} onHide={onHide} hideSettingsLoading={hideSettingsLoading.includes(item._id.toString())} />
								{deleteConfirm === item._id.toString() ? (
									<div className="deleteConfirm">
										<Button size="mini" type="primaryDanger" label="Delete" loading={deleteLoading} onClick={() => onDelete(item._id.toString())} />
										<Button size="mini" type="secondary" label="Cancel" onClick={() => setDeleteConfirm(null)} />
									</div>
								) : (
									<Button
										className="deleteBtn"
										size="mini"
										type="secondaryDanger"
										icon="f1f8"
										iconType="solid"
										onClick={() => setDeleteConfirm(item._id.toString())}
									/>
								)}
							</div>
						))
					)}
				</div>
			</div>

			{modalOpen && (
				<MenuItemModal open={modalOpen} setOpen={setModalOpen} item={editItem} categories={profile?.categories ?? []} onSaved={() => profileMutate()} />
			)}
		</div>
	);
};

export default MenuEditor;
