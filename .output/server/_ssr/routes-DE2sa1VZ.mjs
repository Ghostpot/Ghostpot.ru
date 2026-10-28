import { i as __toESM } from "../_runtime.mjs";
import { Y as require_react, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as HomeView, c as MusicView, d as Shell, f as ShopView, g as WorldsView, h as WorldView, i as GalleryView, l as ProgramsView, m as Whisper, n as BookView, o as LawView, p as StreamsView, r as CookieNote, s as LucyView, t as AboutView, u as ReadView, v as parseHash } from "./chronicle-CNvfZq7E.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DE2sa1VZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const [view, setView] = (0, import_react.useState)({ name: "home" });
	(0, import_react.useEffect)(() => {
		const sync = () => setView(parseHash());
		sync();
		window.addEventListener("hashchange", sync);
		return () => window.removeEventListener("hashchange", sync);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
		view,
		children: [
			view.name === "home" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeView, {}) : null,
			view.name === "worlds" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorldsView, {}) : null,
			view.name === "world" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorldView, { id: view.id }) : null,
			view.name === "book" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookView, {}) : null,
			view.name === "read" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReadView, { id: view.id }) : null,
			view.name === "music" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MusicView, {}) : null,
			view.name === "gallery" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GalleryView, {}) : null,
			view.name === "shop" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopView, {}) : null,
			view.name === "about" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AboutView, {}) : null,
			view.name === "lucy" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LucyView, {}) : null,
			view.name === "streams" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StreamsView, {}) : null,
			view.name === "programs" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgramsView, {}) : null,
			view.name === "law" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LawView, {}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Whisper, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CookieNote, {})
		]
	});
}
//#endregion
export { Home as component };
