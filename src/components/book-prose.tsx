import { useEffect, useRef } from "react";
import type { Chapter } from "@/data/content";
import { Shot } from "@/components/ui";
import { useBookAudio } from "@/lib/book-audio";
import { chapterWords, cuePoint, loadCues, speakAt, voiceRatio, type RawCue } from "@/lib/karaoke";

function platesAfter(plates: Chapter["plates"]) {
  const map = new Map<number, NonNullable<Chapter["plates"]>>();
  for (const plate of plates ?? []) {
    const list = map.get(plate.after) ?? [];
    list.push(plate);
    map.set(plate.after, list);
  }
  return map;
}

function Plates({ plates }: { plates: NonNullable<Chapter["plates"]> }) {
  return plates.map((plate) => (
    <figure className="plate" key={plate.src}>
      <Shot src={plate.src} alt={plate.alt} />
      <figcaption>{plate.alt}</figcaption>
    </figure>
  ));
}

export function BookProse({
  chapterId,
  chapters,
  paragraphs,
  plates,
  size,
  karaoke,
  onFollow,
}: {
  chapterId: string;
  chapters: Chapter[];
  paragraphs: string[];
  plates: Chapter["plates"];
  size: "s" | "m" | "l";
  karaoke: boolean;
  onFollow: (id: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const onFollowRef = useRef(onFollow);
  onFollowRef.current = onFollow;
  const after = platesAfter(plates);

  useEffect(() => {
    if (!karaoke) return;
    const root = rootRef.current;
    if (!root) return;
    const { words, total } = chapterWords(paragraphs);
    const flat = words.flat();
    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-w]"));
    let now = -1;
    let chasing = "";
    const cuesRef: { current: Record<string, RawCue[]> | null } = { current: null };
    let dead = false;

    const wordAt = (pos: number) => {
      let lo = 0;
      let hi = flat.length - 1;
      let ans = 0;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (flat[mid].start <= pos) {
          ans = mid;
          lo = mid + 1;
        } else hi = mid - 1;
      }
      return ans;
    };

    const paint = () => {
      const state = useBookAudio.getState();
      const track = state.index >= 0 ? state.queue[state.index] : undefined;
      if (!track || !flat.length) return;
      const timed = cuesRef.current?.[track.id];
      let chapterHit = "";
      let pos = -1;
      if (timed?.length) {
        const hit = cuePoint(timed, state.currentTime);
        if (!hit) return;
        chapterHit = hit.chapterId;
        pos = hit.pos;
      } else if (state.duration > 0) {
        const voice = voiceRatio(track.id, state.currentTime, state.duration);
        if (!voice) return;
        const at = speakAt(chapters, voice.group, voice.ratio);
        if (!at) return;
        chapterHit = at.chapterId;
        if (!cuesRef.current && chapterHit !== chapterId) return;
        pos = at.ratio * total;
      } else return;
      if (chapterHit !== chapterId) {
        if (state.playing && chasing !== chapterHit) {
          chasing = chapterHit;
          onFollowRef.current(chapterHit);
        }
        return;
      }
      chasing = "";
      const found = wordAt(pos);
      const current = nodes[found];
      if (!current) return;
      if (found !== now) {
        const low = now < 0 ? 0 : Math.min(now, found);
        const high = now < 0 ? found : Math.max(now, found);
        for (let item = low; item <= high; item += 1) {
          const node = nodes[item];
          if (!node) continue;
          node.classList.toggle("is-said", item < found);
          node.classList.toggle("is-now", item === found);
          if (item !== found) node.style.removeProperty("--p");
        }
        now = found;
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed) return;
        const rect = current.getBoundingClientRect();
        const topLimit = window.innerHeight * 0.22;
        const bottomLimit = window.innerHeight - 150;
        if (rect.top < topLimit || rect.bottom > bottomLimit) {
          const far = rect.top < -window.innerHeight || rect.bottom > window.innerHeight * 2;
          const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          current.scrollIntoView({ block: "center", behavior: far || reduce ? "auto" : "smooth" });
        }
      }
      const word = flat[found];
      const fill = Math.min(100, Math.max(0, ((pos - word.start) / Math.max(1, word.end - word.start)) * 100));
      current.style.setProperty("--p", `${fill.toFixed(1)}%`);
    };

    void loadCues().then((data) => {
      if (dead) return;
      cuesRef.current = data;
      paint();
    });
    paint();
    const unsub = useBookAudio.subscribe(paint);
    return () => {
      dead = true;
      unsub();
    };
  }, [karaoke, chapterId, chapters, paragraphs]);

  if (!karaoke) {
    return (
      <div className="prose" data-size={size}>
        {paragraphs.map((paragraph, paragraphIndex) => (
          <div key={`${chapterId}-${paragraphIndex}`}>
            <p>{paragraph}</p>
            <Plates plates={after.get(paragraphIndex) ?? []} />
          </div>
        ))}
      </div>
    );
  }

  let wordIndex = 0;
  return (
    <div className="prose" data-size={size} data-karaoke="1" ref={rootRef}>
      {paragraphs.map((paragraph, paragraphIndex) => (
        <div key={`${chapterId}-${paragraphIndex}`}>
          <p>
            {paragraph.split(/(\s+)/).map((part, partIndex) => {
              if (!part) return null;
              if (/^\s+$/.test(part)) return part;
              const index = wordIndex;
              wordIndex += 1;
              return (
                <span key={index} className="kara-word" data-w={index}>
                  {part}
                </span>
              );
            })}
          </p>
          <Plates plates={after.get(paragraphIndex) ?? []} />
        </div>
      ))}
    </div>
  );
}
