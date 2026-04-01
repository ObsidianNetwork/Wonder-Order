import { APP } from "#utils/config/constants";
import { scrollToSection } from "#utils/helper/common";
import "./navbar.scss";

export default function Navbar({ menuOpen, setMenuOpen }: TNavBarProps) {
	return (
		<div className="homeNavbar" id="homepage-navBar">
			<div className="logo" onClick={() => scrollToSection()}>
				{APP.name}
			</div>
			<div className={`menu ${menuOpen ? "open" : ""}`}>
				<div className="icon round" onClick={() => setMenuOpen(!menuOpen)}>
					<span className="line1" />
					<span className="line2" />
				</div>
				<div className="container">
					<div
						className="item"
						onClick={() => {
							scrollToSection("homepage-login");
							setMenuOpen(false);
						}}>
						<p>Sign In</p>
					</div>
				</div>
			</div>
		</div>
	);
}

type TNavBarProps = {
	menuOpen: boolean;
	setMenuOpen: (menuOpen: boolean) => void;
};
