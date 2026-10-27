import type { Chapter, VideoList } from "./content";
import chaptersJson from "./chapters.json";
import videosJson from "./videos.json";

const chapters = chaptersJson as Chapter[];
const videos = videosJson as Record<string, VideoList[]>;

export function loadChapters() {
  return Promise.resolve(chapters);
}

export function loadVideos() {
  return Promise.resolve(videos);
}

export function platesOf(chapters: Chapter[]) {
  const seen = new Set<string>();
  const list: { src: string; alt: string }[] = [];
  for (const chapter of chapters) {
    for (const plate of chapter.plates ?? []) {
      if (seen.has(plate.src)) continue;
      seen.add(plate.src);
      list.push({ src: plate.src, alt: plate.alt });
    }
  }
  return list;
}
