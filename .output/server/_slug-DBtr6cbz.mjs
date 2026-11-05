import { x as require_jsx_runtime } from "./_libs/@tanstack/react-router+[...].mjs";
import { d as Shell } from "./_ssr/chronicle-YF2IGL38.mjs";
import { n as Route } from "./_ssr/router-CQ43v-XS.mjs";
import { t as GuideArticle } from "./_ssr/guides-view-BiQNqitF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_slug-DBtr6cbz.js
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
