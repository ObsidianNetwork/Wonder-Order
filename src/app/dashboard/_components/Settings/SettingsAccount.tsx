import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Avatar, Button, Spinner, Textfield } from "xtreme-ui";

import { useAdmin } from "#components/context/useContext";
import { splitStringByFirstWord } from "#utils/helper/common";

import PasswordSettings from "./PasswordSettings";
import ThemeSettings from "./ThemeSettings";
import "./settingsAccount.scss";

const SettingsAccount = () => {
	const router = useRouter();
	const { profile, profileMutate } = useAdmin();
	const session = useSession();
	const [restaurantName, setRestaurantName] = useState<string[]>([]);
	const [editing, setEditing] = useState(false);
	const [saving, setSaving] = useState(false);

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [address, setAddress] = useState("");
	const [avatar, setAvatar] = useState("");

	useEffect(() => {
		if (profile?.name) setRestaurantName(splitStringByFirstWord(profile?.name) ?? []);
	}, [profile?.name]);

	useEffect(() => {
		if (profile) {
			setName(profile.name ?? "");
			setDescription(profile.description ?? "");
			setAddress(profile.address ?? "");
			setAvatar(profile.avatar ?? "");
		}
	}, [profile]);

	const onSave = async () => {
		setSaving(true);
		const res = await fetch("/api/admin/profile", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name, description, address, avatar }),
		});
		setSaving(false);
		if (!res.ok) return toast.error("Failed to save");
		toast.success("Profile updated");
		setEditing(false);
		await profileMutate();
	};

	if (session.status === "loading" || !profile) return <Spinner fullpage label="Loading Account..." />;

	return (
		<div className="settingsAccount">
			<div className="profileSettingsCard">
				{profile?.avatar && <Avatar className="avatar" src={profile?.avatar} />}
				<div className="restaurantDetails">
					{!editing ? (
						<>
							<h1 className="name">
								{restaurantName[0]} <span>{restaurantName[1]}</span>
							</h1>
							<h6 className="address">{profile?.address}</h6>
							{profile?.description && <p className="description">{profile.description}</p>}
						</>
					) : (
						<div className="editFields">
							<Textfield placeholder="Restaurant name" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} />
							<Textfield placeholder="Address" value={address} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)} />
							<Textfield
								placeholder="Description"
								value={description}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
							/>
							<Textfield placeholder="Avatar URL" value={avatar} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAvatar(e.target.value)} />
						</div>
					)}
				</div>
				<div className="profileActions">
					{editing ? (
						<>
							<Button className="save" icon="f00c" size="mini" onClick={onSave} loading={saving} />
							<Button className="cancel" icon="f00d" size="mini" type="secondary" onClick={() => setEditing(false)} />
						</>
					) : (
						<>
							<Button className="edit" icon="f304" size="mini" onClick={() => setEditing(true)} />
							<Button className="logout" icon="f011" onClick={() => router.push("/logout")} />
						</>
					)}
				</div>
			</div>
			<div className="orderSettingsCard">
				<div className="settingRow">
					<div className="settingInfo">
						<span className="settingLabel">Auto-Accept Orders</span>
						<span className="settingDesc">Orders go straight to kitchen without manual approval</span>
					</div>
					<button
						type="button"
						className={`toggle ${profile?.autoAcceptOrders ? "on" : ""}`}
						onClick={async () => {
							await fetch("/api/admin/profile", {
								method: "PATCH",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({ autoAcceptOrders: !profile?.autoAcceptOrders }),
							});
							profileMutate();
						}}
					/>
				</div>
			</div>
			<PasswordSettings />
			<ThemeSettings />
		</div>
	);
};

export default SettingsAccount;
