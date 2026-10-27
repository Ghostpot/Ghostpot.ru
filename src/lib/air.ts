import { createServerFn } from "@tanstack/react-start";

export type AirItem = {
  id: string;
  title: string;
  at: string;
  href: string;
  thumb: string;
  world: string;
};

const FEED = "https://www.youtube.com/feeds/videos.xml?channel_id=UCSEgw1Ws8L2nZdMSl-AWykQ";
let cache: { at: number; items: AirItem[] } | null = null;
let pending: Promise<AirItem[]> | null = null;

function decode(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function worldOf(title: string) {
  const text = title.toLowerCase();
  if (text.includes("zomboid")) return "PROJECT ZOMBOID";
  if (text.includes("wow") || text.includes("sirus") || text.includes("азерот")) return "Азерот";
  if (text.includes("gothic") || text.includes("готик")) return "Готика";
  if (text.includes("kenshi") || text.includes("кенши")) return "Кенши";
  if (text.includes("fallout") || text.includes("фолаут")) return "Fallout";
  return "";
}

async function pull(): Promise<AirItem[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  try {
    const res = await fetch(FEED, { signal: ctrl.signal, headers: { "User-Agent": "Ghostpot/1.0" } });
    if (!res.ok) return cache?.items ?? [];
    const xml = await res.text();
    const items: AirItem[] = [];
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
        world: worldOf(name),
      });
    }
    return items;
  } catch {
    return cache?.items ?? [];
  } finally {
    clearTimeout(timer);
  }
}

export const getAir = createServerFn({ method: "GET" }).handler(async () => {
  const now = Date.now();
  if (cache && now - cache.at < 60 * 60 * 1000) return cache.items;
  if (pending) return pending;
  pending = pull()
    .then((items) => {
      if (items.length) cache = { at: Date.now(), items };
      return items.length ? items : (cache?.items ?? []);
    })
    .finally(() => {
      pending = null;
    });
  return pending;
});
