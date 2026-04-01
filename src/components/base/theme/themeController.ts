import type { ThemeColor } from "./ThemeProvider";

/**
 * Returns an inline script string that sets CSS variables for the brand colour
 * before React hydrates. Drop-in replacement for xtreme-ui's themeController.
 *
 * Usage in a server component / layout:
 *   <script dangerouslySetInnerHTML={{ __html: themeController({ color }) }} suppressHydrationWarning />
 */
export function themeController({
	color,
	scheme,
}: { color?: ThemeColor; scheme?: string } = {}): string {
	const colorJson = color ? JSON.stringify(color) : "null";
	const schemeStr = scheme ? `"${scheme}"` : "null";

	return `(function(){
	try{
		var storedScheme=localStorage.getItem("xThemeScheme");
		var themeScheme=${schemeStr}||storedScheme||"auto";
		var c=${colorJson};
		if(!c){try{c=JSON.parse(localStorage.getItem("xThemeColor"))}catch(e){}}
		if(c&&typeof c.h==="number"){
			var s=document.getElementById("xThemeColor")||document.head.appendChild(Object.assign(document.createElement("style"),{id:"xThemeColor"}));
			s.textContent=":root{ --H: "+c.h+"; --S: "+c.s+"%; --L: "+c.l+"% }";
			var m=document.head.querySelector('meta[name="theme-color"]');
			if(!m){m=document.createElement("meta");m.name="theme-color";document.head.appendChild(m)}
			m.content="hsl("+c.h+","+c.s+"%,"+c.l+"%)";
			localStorage.setItem("xThemeColor",JSON.stringify(c));
		}
		document.documentElement.setAttribute("data-theme-scheme",themeScheme);
		localStorage.setItem("xThemeScheme",themeScheme);
	}catch(e){}
})();`;
}
