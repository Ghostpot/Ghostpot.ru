import { x as require_jsx_runtime } from "./_libs/@tanstack/react-router+[...].mjs";
import { d as Shell } from "./_ssr/chronicle-DDPrCdv_.mjs";
import { n as Route } from "./_ssr/router-D4E-3YrS.mjs";
import { t as GuideArticle } from "./_ssr/guides-view-BhOs6Xk9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_slug-Ds5F-Brq.js
var import_jsx_runtime = require_jsx_runtime();
var SplitComponent = function GuidePage() {
	const guide = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, {
		view: { name: "law" },
		guides: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuideArticle, { guide })
	});
};
//#endregion
export { SplitComponent as component };
