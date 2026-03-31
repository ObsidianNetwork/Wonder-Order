import Script from "next/script";
import type { ReactNode } from "react";

import { themeController } from "xtreme-ui";

import { getThemeColor } from "#utils/database/helper/getThemeColor";

export const metadata = {
	title: "Wonder-Order ⌘ Admin",
};
export default async function RootLayout({ children }: IRootProps) {
	const themeColor = await getThemeColor();
	return (
		<>
			<Script id="theme-controller" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeController({ color: themeColor }) }} />
			{children}
		</>
	);
}

interface IRootProps {
	children?: ReactNode;
}
