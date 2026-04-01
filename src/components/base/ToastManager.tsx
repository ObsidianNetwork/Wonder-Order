import { ToastContainer } from "react-toastify";
import { useTheme } from "#components/base/theme";

export const ToastManager = () => {
	const { themeScheme } = useTheme();

	return <ToastContainer position="top-center" theme={themeScheme === "light" ? "light" : "dark"} />;
};
