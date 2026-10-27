import worldsJson from "./worlds.json";
import chapterIndexJson from "./chapter-index.json";
import videoCountsJson from "./video-counts.json";
import partyJson from "./party.json";

export const ORIGIN = "https://ghostpot.ru";

const LOCAL = new Set([
  "/brand/ghostpot-word.webp",
  "/brand/book.webp",
  "/brand/hero-photo.webp",
  "/brand/hungry.webp",
  "/brand/nikolay.webp",
]);

export function media(src: string) {
  if (!src) return "";
  if (src.startsWith("http") || LOCAL.has(src.split("?")[0])) return src;
  return `${ORIGIN}${src}`;
}

export type Track = {
  title: string;
  length: string;
  note?: string;
  src?: string;
};

export type Playlist = {
  name: string;
  youtube?: string;
  rutube?: string;
};

export type World = {
  name: string;
  mark: string;
  live: boolean;
  album: string;
  cover: string;
  sleeve?: string;
  text: string;
  game: string;
  lived: string;
  youtube?: string;
  rutube?: string;
  lists: Playlist[];
  tracks: Track[];
};

export type ChapterMeta = {
  id: string;
  numeral: string;
  title: string;
  kicker: string;
  dek: string;
  count: number;
};

export type Chapter = {
  id: string;
  numeral: string;
  title: string;
  kicker: string;
  dek: string;
  paragraphs: string[];
  plates: { after: number; alt: string; src: string }[];
};

export type VideoItem = {
  title: string;
  href: string;
  poster: string;
  note: string;
};

export type VideoList = {
  name: string;
  href: string;
  videos: VideoItem[];
};

export type Gear = { k: string; v: string; icon: string };
export type Profile = {
  name: string;
  title: string;
  className: string;
  classIcon?: string;
  portrait: string;
  alt: string;
  note: string;
  gear?: Gear[];
  spells?: Gear[];
};

export const worlds = worldsJson as World[];
export const chapterIndex = chapterIndexJson as ChapterMeta[];
export const videoCounts = videoCountsJson as Record<string, number>;
export const party = partyJson as Profile[];

export type Playable = {
  title: string;
  world: string;
  src: string;
  cover: string;
  length: string;
  note: string;
};

export const catalog: Playable[] = worlds.flatMap((world) =>
  world.tracks
    .filter((track) => track.src)
    .map((track) => ({
      title: track.title,
      world: world.name,
      src: track.src as string,
      cover: world.sleeve || world.cover,
      length: track.length,
      note: track.note ?? "",
    })),
);

export const lucySongs: Playable[] = [
  {
    title: "Ни то",
    world: "Люси",
    src: "/chronicle/music/nito.mp3",
    cover: "/chronicle/music/sleeves/lucy.jpg",
    length: "2:31",
    note: "Косичка криво, носки как жуки. Хотелось лето, а всё не то.",
  },
  {
    title: "Сон",
    world: "Люси",
    src: "/chronicle/music/son.mp3",
    cover: "/chronicle/music/sleeves/lucy.jpg",
    length: "4:30",
    note: "В метро, в пробке и в кресле. Нет сил оторваться и вернуться из сказки.",
  },
];

catalog.push(...lucySongs);

export const nights = [
  {
    when: "5 октября 2026, ночь",
    where: "PROJECT ZOMBOID",
    note: "Около трёх часов, без сейва.",
  },
  {
    when: "28 сентября 2026, ночь",
    where: "PROJECT ZOMBOID",
    note: "Мёртвые и бандиты. Первая часть той жизни.",
  },
  {
    when: "Эфир без даты на афише",
    where: "Азерот",
    note: "Книга 2, WoW Сирус, хардкор. Точное время — только в Telegram.",
  },
];

export const channels = [
  { name: "YouTube", href: "https://www.youtube.com/@gh0stpot", note: "Записи и шорты" },
  { name: "Rutube", href: "https://rutube.ru/channel/42619609/", note: "Записи" },
  { name: "GoodGame", href: "https://goodgame.ru/Ghostpot", note: "Эфир" },
  { name: "Twitch", href: "https://www.twitch.tv/ghostpot", note: "Эфир" },
  { name: "Trovo", href: "https://trovo.live/s/Ghostpot", note: "Эфир" },
  { name: "Kick", href: "https://kick.com/ghostpot", note: "Эфир" },
  { name: "DLive", href: "https://dlive.tv/Ghostpot", note: "Эфир" },
  { name: "Steam", href: "https://steamcommunity.com/broadcast/watch/76561198059361723", note: "Трансляция" },
  { name: "Boosty", href: "https://boosty.to/ghostpot", note: "Поддержать" },
  { name: "W.TV", href: "https://w.tv/ghostpot", note: "Эфир" },
  { name: "Дзен", href: "https://dzen.ru/ghostpot", note: "Записи" },
  { name: "VK Видео", href: "https://live.vkvideo.ru/ghostpot", note: "Трансляции и записи" },
];

export const links = {
  telegram: "https://t.me/ghostpotplay",
  max: "https://max.ru/channel_Ghostpot",
  mail: "mailto:nikolay@whitebunny.ru",
  email: "nikolay@whitebunny.ru",
  boosty: "https://boosty.to/ghostpot",
  alerts: "https://www.donationalerts.com/r/ghostpot_play",
  twitch: "https://www.twitch.tv/ghostpot",
  vkArchive: "https://vkvideo.ru/@club226635413",
};

export const skills = [
  { name: "Сайт", note: "Чужие страницы, свои нервы." },
  { name: "Эфир", note: "Не выходит, пока история жива." },
  { name: "Книга", note: "Пишется прямо в ночи." },
  { name: "Песня", note: "Если мир молчит, она поёт." },
  { name: "Стойкость", note: "Сорок лет, ещё дышит." },
  { name: "Сумка", note: "Почти пустая. Классика." },
];

export const passport: [string, string][] = [
  ["Имя", "Люси"],
  ["Возраст", "25"],
  ["Рост", "172"],
  ["Уши", "Рысьи. Эльфийские только в Азероте."],
  ["Лицо", "Одно и то же в каждом мире."],
  ["Характер", "Сарказм вместо брони. Усталость, не крик."],
  ["Как попадает", "Без вещей. Мир решает, кем она тут числится."],
  ["Что не меняется", "Голос, лицо и привычка шутить, когда страшно."],
];

export const hatShots = [
  { src: "/shop/lucy-1.jpg", alt: "Люси в банной шапке в парной." },
  { src: "/shop/lucy-2.jpg", alt: "Люси крупно, видна вязка шапки." },
  { src: "/shop/lucy-3.jpg", alt: "Люси показывает шапку и мешочек." },
  { src: "/shop/lucy-4.jpg", alt: "Люси в шапке на полке." },
  { src: "/shop/hat-real.jpg", alt: "Живое фото шапки с льняным мешочком." },
];

export function videoCount(name: string) {
  return videoCounts[name] ?? 0;
}

export function volumes() {
  const order: string[] = [];
  const map = new Map<string, ChapterMeta[]>();
  for (const chapter of chapterIndex) {
    const key = chapter.kicker || "Книга";
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key)!.push(chapter);
  }
  return order.map((name) => ({ name, chapters: map.get(name)! }));
}
