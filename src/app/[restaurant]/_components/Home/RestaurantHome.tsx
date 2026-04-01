"use client";

import { type UIEvent, useRef, useState } from "react";
import { Button } from "#components/base";

import { useRestaurant } from "#components/context/useContext";
import { useQueryParams } from "#utils/hooks/useQueryParams";
import { useScrollReveal } from "#utils/hooks/useScrollReveal";

import "./restaurantHome.scss";

const RestaurantHome = () => {
	const { restaurant } = useRestaurant();
	const params = useQueryParams();
	const scrollRef = useRef<HTMLDivElement>(null);
	const [parallaxY, setParallaxY] = useState(0);

	useScrollReveal(scrollRef);

	const profile = restaurant?.profile;

	const onScroll = (e: UIEvent<HTMLDivElement>) => {
		setParallaxY((e.target as HTMLDivElement).scrollTop * 0.4);
	};

	return (
		<div className="restaurantHome snapScroll" ref={scrollRef} onScroll={onScroll}>
			<section className="heroSection snapSection">
				<div
					className="heroBg parallaxBg"
					style={{ transform: `translateY(${parallaxY}px)`, backgroundImage: profile?.cover ? `url(${profile.cover})` : undefined }}
				/>
				<div className="heroOverlay" />
				<div className="heroContent scrollRevealStagger">
					{profile?.avatar && (
						<div className="heroAvatar">
							{/* biome-ignore lint/performance/noImgElement: Restaurant logo */}
							<img src={profile.avatar} alt={profile?.name} />
						</div>
					)}
					<h1 className="heroTitle">{profile?.name}</h1>
					{profile?.description && <p className="heroSubtitle">{profile.description}</p>}
					<div className="heroCta">
						<Button label="View Menu" onClick={() => params.set({ tab: "menu" })} />
					</div>
				</div>
			</section>

			<footer className="homeFooter snapSectionAuto">
				<p className="footerName">{profile?.name}</p>
				{profile?.address && <p className="footerAddress">{profile.address}</p>}
				<p className="footerPowered">Powered by Wonder-Order</p>
			</footer>
		</div>
	);
};

export default RestaurantHome;
