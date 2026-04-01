import { usePathname, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Button, Textfield } from "#components/base";

import "./userLogin.scss";

const phonePattern = /^\+?\d{7,15}$/;

function detectCountry(): { code: string; dial: string; flag: string } {
	const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
	const tzMap: Record<string, { code: string; dial: string }> = {
		Australia: { code: "AU", dial: "61" },
		"America/New_York": { code: "US", dial: "1" },
		"America/Chicago": { code: "US", dial: "1" },
		"America/Denver": { code: "US", dial: "1" },
		"America/Los_Angeles": { code: "US", dial: "1" },
		"Europe/London": { code: "GB", dial: "44" },
		"Europe/Berlin": { code: "DE", dial: "49" },
		"Europe/Paris": { code: "FR", dial: "33" },
		"Asia/Tokyo": { code: "JP", dial: "81" },
		"Asia/Shanghai": { code: "CN", dial: "86" },
		"Asia/Kolkata": { code: "IN", dial: "91" },
		"Asia/Singapore": { code: "SG", dial: "65" },
		"Pacific/Auckland": { code: "NZ", dial: "64" },
		"America/Toronto": { code: "CA", dial: "1" },
	};

	let match = { code: "AU", dial: "61" };
	for (const [key, val] of Object.entries(tzMap)) {
		if (tz.startsWith(key) || tz === key) {
			match = val;
			break;
		}
	}

	const flag = Array.from(match.code)
		.map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
		.join("");
	return { ...match, flag };
}

const UserLogin = ({ setOpen }: UserLoginProps) => {
	const pathname = usePathname();
	const params = useSearchParams();
	const [step, setStep] = useState<"phone" | "details">("phone");
	const [buttonLabel, setButtonLabel] = useState("Next");
	const [busy, setBusy] = useState(false);

	const country = useMemo(() => detectCountry(), []);
	const [phone, setPhone] = useState("");
	const [fname, setFName] = useState("");
	const [lname, setLName] = useState("");
	const [heading, setHeading] = useState(["Let's", " start ordering"]);

	const getFullPhone = () => {
		const trimmed = phone.trim();
		if (trimmed.startsWith("+")) return trimmed;
		const stripped = trimmed.startsWith("0") ? trimmed.slice(1) : trimmed;
		return `+${country.dial}${stripped}`;
	};

	const onNext = async () => {
		if (step === "phone") {
			const fullPhone = getFullPhone();
			if (!phonePattern.test(fullPhone)) {
				return toast.error("Please enter a valid phone number");
			}
			setBusy(true);
			setTimeout(() => {
				setBusy(false);
				setStep("details");
			}, 300);
		} else {
			if (!params.get("table")) return toast.error("No table selected");
			if (!fname.trim()) return toast.error("First name is required");
			if (!lname.trim()) return toast.error("Last name is required");

			setBusy(true);

			const res = await signIn("customer", {
				redirect: false,
				restaurant: pathname.replaceAll("/", ""),
				phone: getFullPhone(),
				fname: fname.trim(),
				lname: lname.trim(),
				table: params.get("table"),
				callbackUrl: `${window.location.origin}`,
			});

			if (res?.error) {
				toast.error(res?.error);
			}
			setOpen(false);
			setBusy(false);
		}
	};

	useEffect(() => {
		if (step === "phone") {
			setHeading(["Let's", " start ordering"]);
			setButtonLabel("Next");
		} else {
			setHeading(["Almost", " there"]);
			setButtonLabel("Start Ordering");
		}
	}, [step]);

	return (
		<div className={`userLogin ${step}`}>
			<div className="header">
				<span className="heading">
					<span>{heading[0]}</span>
					{heading[1]}
				</span>
			</div>
			<div className="content">
				<div className="phoneInput">
					<div className="phonePrefix">
						<span className="flag">{country.flag}</span>
						<span className="dialCode">+{country.dial}</span>
					</div>
					<input
						id="user-login-phone"
						type="tel"
						placeholder="Phone number"
						autoComplete="tel"
						value={phone}
						onKeyDown={(e) => e.key === "Enter" && onNext()}
						onChange={(e) => setPhone(e.target.value)}
					/>
				</div>
				<div className="nameContainer">
					<Textfield
						id="user-login-fname"
						className="fName"
						placeholder="First Name"
						autoComplete="given-name"
						value={fname}
						onChange={(e: ChangeEvent<HTMLInputElement>) => setFName(e.target.value)}
					/>
					<Textfield
						id="user-login-lname"
						className="lName"
						placeholder="Last Name"
						autoComplete="family-name"
						onEnterKey={onNext}
						value={lname}
						onChange={(e: ChangeEvent<HTMLInputElement>) => setLName(e.target.value)}
					/>
				</div>
			</div>
			<div className="footer">
				<Button label={buttonLabel} onClick={onNext} loading={busy} />
			</div>
		</div>
	);
};

export default UserLogin;

type UserLoginProps = {
	setOpen: (open: boolean) => void;
};
