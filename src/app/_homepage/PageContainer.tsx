"use client";

import { useRef, useState } from "react";

import { useScrollReveal } from "#utils/hooks/useScrollReveal";

import FooterSection from "./FooterSection";
import LandingSection from "./LandingSection";
import LoginSection from "./LoginSection";
import Navbar from "./Navbar";

export default function PageContainer() {
	const [menuOpen, setMenuOpen] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);
	useScrollReveal(scrollRef);

	return (
		<div className="homepage">
			<Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
			<main ref={scrollRef} className={`homepageSections snapScroll ${menuOpen ? "menuOpen" : ""}`}>
				<LandingSection />
				<LoginSection />
				<FooterSection />
			</main>
		</div>
	);
}
