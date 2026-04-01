import { DEFAULT_THEME_COLOR, themeController } from "#components/base/theme";
import { getThemeColor } from "#utils/database/helper/getThemeColor";
import ScannerClient from "./ScannerClient";

export default async function ScanPage() {
	const color = (await getThemeColor()) ?? DEFAULT_THEME_COLOR;

	return (
		<>
			<script dangerouslySetInnerHTML={{ __html: themeController({ color }) }} suppressHydrationWarning />
			<ScannerClient />
		</>
	);
}
