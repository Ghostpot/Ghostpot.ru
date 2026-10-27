import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/live-BAsXlXnl.js
var UA = "Mozilla/5.0 (compatible; Ghostpot/1.0)";
var cache = null;
var pending = null;
async function grab(url, init, ms = 2500) {
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), ms);
	try {
		return await fetch(url, {
			...init,
			signal: ctrl.signal,
			headers: {
				"User-Agent": UA,
				...init?.headers ?? {}
			}
		});
	} finally {
		clearTimeout(timer);
	}
}
async function twitch() {
	const res = await grab("https://gql.twitch.tv/gql", {
		method: "POST",
		headers: {
			"Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko",
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ query: "{ user(login: \"ghostpot\") { stream { title game { name } } } }" })
	});
	if (!res.ok) return null;
	const stream = (await res.json())?.data?.user?.stream;
	if (!stream) return null;
	return {
		platform: "Twitch",
		href: "https://www.twitch.tv/ghostpot",
		title: String(stream.title || "Эфир"),
		game: String(stream.game?.name || "")
	};
}
async function kick() {
	const res = await grab("https://kick.com/api/v2/channels/ghostpot");
	if (!res.ok) return null;
	const stream = (await res.json())?.livestream;
	if (!stream) return null;
	const game = stream.categories?.[0]?.name || stream.category?.name || "";
	return {
		platform: "Kick",
		href: "https://kick.com/ghostpot",
		title: String(stream.session_title || stream.slug || "Эфир"),
		game: String(game)
	};
}
async function goodgame() {
	const res = await grab("https://goodgame.ru/api/getchannelstatus?id=Ghostpot&fmt=json");
	if (!res.ok) return null;
	const data = await res.json();
	const status = String(data?.status || data?.online || "").toLowerCase();
	if (!(status === "online" || status === "live" || data?.is_online === true || data?.online === 1)) return null;
	return {
		platform: "GoodGame",
		href: "https://goodgame.ru/Ghostpot",
		title: String(data?.title || data?.stream_title || "Эфир"),
		game: String(data?.game || data?.game_name || "")
	};
}
async function safe(job) {
	try {
		return await job();
	} catch {
		return null;
	}
}
var getLive_createServerFn_handler = createServerRpc({
	id: "c4e1288f5a7df1bccf074f594b7d493a39d9dfd2850659cb73d37090b1ec91df",
	name: "getLive",
	filename: "src/lib/live.ts"
}, (opts) => getLive.__executeServer(opts));
var getLive = createServerFn({ method: "GET" }).handler(getLive_createServerFn_handler, async () => {
	if (cache && Date.now() - cache.at < cache.ttl) return cache.report;
	if (pending) return pending;
	pending = (async () => {
		const report = { hits: (await Promise.all([
			safe(twitch),
			safe(kick),
			safe(goodgame)
		])).filter((item) => Boolean(item)) };
		cache = {
			at: Date.now(),
			ttl: report.hits.length ? 18e4 : 9e5,
			report
		};
		return report;
	})().finally(() => {
		pending = null;
	});
	return pending;
});
//#endregion
export { getLive_createServerFn_handler };
