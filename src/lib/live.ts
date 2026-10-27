import { createServerFn } from "@tanstack/react-start";

export type LiveHit = {
  platform: string;
  href: string;
  title: string;
  game: string;
};

export type LiveReport = {
  hits: LiveHit[];
};

const UA = "Mozilla/5.0 (compatible; Ghostpot/1.0)";
let cache: { at: number; ttl: number; report: LiveReport } | null = null;
let pending: Promise<LiveReport> | null = null;

async function grab(url: string, init?: RequestInit, ms = 2500) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal, headers: { "User-Agent": UA, ...(init?.headers ?? {}) } });
  } finally {
    clearTimeout(timer);
  }
}

async function twitch(): Promise<LiveHit | null> {
  const res = await grab("https://gql.twitch.tv/gql", {
    method: "POST",
    headers: { "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko", "Content-Type": "application/json" },
    body: JSON.stringify({ query: '{ user(login: "ghostpot") { stream { title game { name } } } }' }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const stream = data?.data?.user?.stream;
  if (!stream) return null;
  return {
    platform: "Twitch",
    href: "https://www.twitch.tv/ghostpot",
    title: String(stream.title || "Эфир"),
    game: String(stream.game?.name || ""),
  };
}

async function kick(): Promise<LiveHit | null> {
  const res = await grab("https://kick.com/api/v2/channels/ghostpot");
  if (!res.ok) return null;
  const data = await res.json();
  const stream = data?.livestream;
  if (!stream) return null;
  const game = stream.categories?.[0]?.name || stream.category?.name || "";
  return {
    platform: "Kick",
    href: "https://kick.com/ghostpot",
    title: String(stream.session_title || stream.slug || "Эфир"),
    game: String(game),
  };
}

async function goodgame(): Promise<LiveHit | null> {
  const res = await grab("https://goodgame.ru/api/getchannelstatus?id=Ghostpot&fmt=json");
  if (!res.ok) return null;
  const data = await res.json();
  const status = String(data?.status || data?.online || "").toLowerCase();
  const on = status === "online" || status === "live" || data?.is_online === true || data?.online === 1;
  if (!on) return null;
  return {
    platform: "GoodGame",
    href: "https://goodgame.ru/Ghostpot",
    title: String(data?.title || data?.stream_title || "Эфир"),
    game: String(data?.game || data?.game_name || ""),
  };
}

async function safe(job: () => Promise<LiveHit | null>) {
  try {
    return await job();
  } catch {
    return null;
  }
}

export const getLive = createServerFn({ method: "GET" }).handler(async (): Promise<LiveReport> => {
  const now = Date.now();
  if (cache && now - cache.at < cache.ttl) return cache.report;
  if (pending) return pending;
  pending = (async () => {
    const found = await Promise.all([safe(twitch), safe(kick), safe(goodgame)]);
    const report = { hits: found.filter((item): item is LiveHit => Boolean(item)) };
    cache = { at: Date.now(), ttl: report.hits.length ? 3 * 60_000 : 15 * 60_000, report };
    return report;
  })().finally(() => {
    pending = null;
  });
  return pending;
});
