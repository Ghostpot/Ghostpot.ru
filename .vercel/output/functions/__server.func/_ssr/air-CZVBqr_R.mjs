import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/air-CZVBqr_R.js
var FEED = "https://www.youtube.com/feeds/videos.xml?channel_id=UCSEgw1Ws8L2nZdMSl-AWykQ";
var cache = null;
var pending = null;
function decode(value) {
	return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, "\"").replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
}
function worldOf(title) {
	const text = title.toLowerCase();
	if (text.includes("zomboid")) return "PROJECT ZOMBOID";
	if (text.includes("wow") || text.includes("sirus") || text.includes("азерот")) return "Азерот";
	if (text.includes("gothic") || text.includes("готик")) return "Готика";
	if (text.includes("kenshi") || text.includes("кенши")) return "Кенши";
	if (text.includes("fallout") || text.includes("фолаут")) return "Fallout";
	return "";
}
async function pull() {
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), 4e3);
	try {
		const res = await fetch(FEED, {
			signal: ctrl.signal,
			headers: { "User-Agent": "Ghostpot/1.0" }
		});
		if (!res.ok) return cache?.items ?? [];
		const xml = await res.text();
		const items = [];
		for (const entry of xml.split("<entry>").slice(1, 16)) {
			const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
			const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1];
			const at = entry.match(/<published>([^<]+)<\/published>/)?.[1];
			const thumb = entry.match(/media:thumbnail url="([^"]+)"/)?.[1];
			if (!id || !title || !at) continue;
			const name = decode(title);
			items.push({
				id,
				title: name,
				at,
				href: `https://www.youtube.com/watch?v=${id}`,
				thumb: thumb || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
				world: worldOf(name)
			});
		}
		return items;
	} catch {
		return cache?.items ?? [];
	} finally {
		clearTimeout(timer);
	}
}
var getAir_createServerFn_handler = createServerRpc({
	id: "ab605dd5c07433d3107966c80e996b46b6d9a0b5baae14cb8bb9d9c9a3369185",
	name: "getAir",
	filename: "src/lib/air.ts"
}, (opts) => getAir.__executeServer(opts));
var getAir = createServerFn({ method: "GET" }).handler(getAir_createServerFn_handler, async () => {
	if (cache && Date.now() - cache.at < 36e5) return cache.items;
	if (pending) return pending;
	pending = pull().then((items) => {
		if (items.length) cache = {
			at: Date.now(),
			items
		};
		return items.length ? items : cache?.items ?? [];
	}).finally(() => {
		pending = null;
	});
	return pending;
});
//#endregion
export { getAir_createServerFn_handler };
