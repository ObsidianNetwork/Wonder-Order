import type { ReactNode } from "react";

import "./platform.scss";

export const metadata = {
	title: "Wonder-Order ⌘ Platform",
};

export default function PlatformLayout({ children }: { children: ReactNode }) {
	return <div className="platformLayout">{children}</div>;
}
