import { narration } from "@/data/narration";

export type SpeakGroup = "prolog" | "glava-1" | "g2" | "g3";

type ScriptChapter = { id: string; paragraphs: string[] };

export function trackPlace(id: string): { group: SpeakGroup; index: number; count: number } | null {
  const prefix = id.startsWith("pro-") ? "pro-" : id.startsWith("c1-") ? "c1-" : id.startsWith("c2-") ? "c2-" : id.startsWith("c3-") ? "c3-" : "";
  if (!prefix) return null;
  const group: SpeakGroup = prefix === "pro-" ? "prolog" : prefix === "c1-" ? "glava-1" : prefix === "c2-" ? "g2" : "g3";
  const list = narration.filter((item) => item.id.startsWith(prefix));
  const index = list.findIndex((item) => item.id === id);
  if (index < 0 || !list.length) return null;
  return { group, index, count: list.length };
}

function groupChapters(chapters: ScriptChapter[], group: SpeakGroup) {
  if (group === "prolog") return chapters.filter((chapter) => chapter.id === "prolog");
  if (group === "glava-1") return chapters.filter((chapter) => chapter.id === "glava-1");
  const prefix = group === "g2" ? "g2-" : "g3-";
  return chapters
    .filter((chapter) => chapter.id.startsWith(prefix))
    .sort((a, b) => a.id.localeCompare(b.id, "ru", { numeric: true }));
}

export function scriptLength(paragraphs: string[]) {
  if (!paragraphs.length) return 1;
  return paragraphs.reduce((sum, paragraph) => sum + paragraph.length, 0) + (paragraphs.length - 1);
}

export function speakAt(chapters: ScriptChapter[], group: SpeakGroup, globalRatio: number) {
  const list = groupChapters(chapters, group);
  if (!list.length) return null;
  const lengths = list.map((chapter) => scriptLength(chapter.paragraphs));
  const total = lengths.reduce((sum, length) => sum + length, 0);
  let pos = Math.min(1, Math.max(0, globalRatio)) * total;
  for (let index = 0; index < list.length; index += 1) {
    const length = lengths[index];
    if (pos < length || index === list.length - 1) {
      return { chapterId: list[index].id, ratio: Math.min(1, Math.max(0, pos / length)) };
    }
    pos -= length;
  }
  return null;
}

const DUR_KEY = "ghostpot-audio-dur";

export function rememberDuration(id: string, duration: number) {
  if (typeof localStorage === "undefined" || !id || !Number.isFinite(duration) || duration < 1) return;
  let all: Record<string, number> = {};
  try {
    all = JSON.parse(localStorage.getItem(DUR_KEY) || "{}") as Record<string, number>;
  } catch {
    all = {};
  }
  const next = Math.round(duration * 10) / 10;
  if (Math.abs((all[id] ?? 0) - next) < 0.4) return;
  all[id] = next;
  localStorage.setItem(DUR_KEY, JSON.stringify(all));
}

export function voiceRatio(id: string, current: number, duration: number) {
  const place = trackPlace(id);
  if (!place || duration <= 0) return null;
  const prefix = id.startsWith("pro-") ? "pro-" : id.startsWith("c1-") ? "c1-" : id.startsWith("c2-") ? "c2-" : "c3-";
  const list = narration.filter((item) => item.id.startsWith(prefix));
  let known: Record<string, number> = {};
  try {
    known = JSON.parse(localStorage.getItem(DUR_KEY) || "{}") as Record<string, number>;
  } catch {
    known = {};
  }
  const guess = duration;
  const lengths = list.map((item) => known[item.id] || guess);
  const total = lengths.reduce((sum, length) => sum + length, 0);
  if (total <= 0) return null;
  const before = lengths.slice(0, place.index).reduce((sum, length) => sum + length, 0);
  const here = Math.min(lengths[place.index] || guess, Math.max(0, current));
  return { group: place.group, ratio: Math.min(1, (before + here) / total) };
}

export type RawCue = [number, number, string, number, number];

let cuesPack: Record<string, RawCue[]> | null = null;
let cuesJob: Promise<Record<string, RawCue[]>> | null = null;

export function loadCues() {
  if (cuesPack) return Promise.resolve(cuesPack);
  if (typeof fetch === "undefined") return Promise.resolve({});
  cuesJob ??= fetch("/chronicle/cues.json?v=3")
    .then((res) => (res.ok ? (res.json() as Promise<Record<string, RawCue[]>>) : {}))
    .then((data) => {
      for (const list of Object.values(data)) {
        if (Array.isArray(list)) list.sort((a, b) => a[0] - b[0]);
      }
      cuesPack = data;
      return data;
    })
    .catch(() => {
      cuesPack = {};
      return cuesPack;
    });
  return cuesJob;
}

export function cuePoint(cues: RawCue[], time: number) {
  let lo = 0;
  let hi = cues.length - 1;
  let ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (cues[mid][0] <= time + 0.03) {
      ans = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  if (ans < 0) return null;
  const [t0, t1, chapterId, start, end] = cues[ans];
  if (time >= t1) return { chapterId, pos: end };
  const fill = Math.min(1, Math.max(0, (time - t0) / Math.max(0.04, t1 - t0)));
  return { chapterId, pos: start + (end - start) * fill };
}

export type KaraWord = { text: string; start: number; end: number };

export function chapterWords(paragraphs: string[]) {
  const words: KaraWord[][] = [];
  let cursor = 0;
  paragraphs.forEach((paragraph, index) => {
    const line: KaraWord[] = [];
    for (const part of paragraph.split(/(\s+)/)) {
      if (!part) continue;
      const start = cursor;
      cursor += part.length;
      if (!/^\s+$/.test(part)) line.push({ text: part, start, end: cursor });
    }
    words.push(line);
    if (index < paragraphs.length - 1) cursor += 1;
  });
  return { words, total: Math.max(1, cursor) };
}
