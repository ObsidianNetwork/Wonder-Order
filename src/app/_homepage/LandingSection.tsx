import { type Dispatch, type MouseEvent, type SetStateAction, useEffect, useRef, useState } from "react";
import { useTheme } from "#components/base/theme";

import { APP } from "#utils/config/constants";
import { scrollToSection } from "#utils/helper/common";

import "./landingSection.scss";

import clsx from "clsx";

const bgImg = "/backgrounds/landingCover.png";
const overlayImg = "/backgrounds/landingCoverOverlay.png";
const maxBlurPerImage = 30;
const maxOverlayTranslate = 0.3;

const LandingSection = () => {
	const { isDarkTheme } = useTheme();
	const ref = useRef<HTMLDivElement>(null);
	const [blurBackground, setBlurBackground] = useState<number>(maxBlurPerImage);
	const [blurOverlay, setBlurOverlay] = useState<number>(maxBlurPerImage);

	const onMouseMove = (event: MouseEvent) => {
		const target = event.target as HTMLDivElement;
		const width = target.clientWidth / 2;
		const height = target.clientHeight / 2;

		const overlayX = maxOverlayTranslate * ((event.pageX - width) / width);
		const overlayY = maxOverlayTranslate * ((event.pageY - height) / height);
		if (ref?.current) ref.current.style.transform = `translate(${overlayX}%, ${overlayY}%)`;
	};

	useEffect(() => {
		const fetchImages = (src: string, setBlur: Dispatch<SetStateAction<number>>) => {
			const xhr = new XMLHttpRequest();
			xhr.open("GET", src, true);
			xhr.responseType = "arraybuffer";
			xhr.onprogress = (event) => setBlur((blur) => maxBlurPerImage - (blur - 4) * (event.loaded / event.total));
			xhr.onload = () => setBlur(0);
			xhr.send();
		};

		fetchImages(bgImg, setBlurBackground);
		fetchImages(overlayImg, setBlurOverlay);
	}, []);

	return (
		<section className={clsx("landingSection snapSection", isDarkTheme && "dark")} id="homepage" style={{ filter: `blur(${blurBackground + blurOverlay}px)` }}>
			<div className="coverBackground parallaxBg" style={{ backgroundImage: `url(${bgImg})` }} />
			<div ref={ref} className="coverOverlay" onMouseMove={onMouseMove} style={{ backgroundImage: `url(${overlayImg})` }} />
			<div className="overlay" />
			<div className="landingGreeting scrollRevealStagger">
				<h1 className="head">{APP.tagline.split(" ")[0]}</h1>
				<p className="subHead">{APP.tagline.split(" ").slice(1).join(" ")}</p>
				<p className="desc">Modern contactless ordering for restaurants.</p>
				<p className="desc">QR codes, live menus, instant kitchen updates.</p>
				<div className="greetingAction">
					<button type="button" className="heroSignIn" onClick={() => scrollToSection("homepage-login")}>
						Sign In
					</button>
				</div>
			</div>
		</section>
	);
};

export default LandingSection;
