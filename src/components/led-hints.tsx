import { useEffect, useRef, useState } from "react";

type HintId =
  | "screen"
  | "popcorn"
  | "shards"
  | "pin"
  | "whisper"
  | "mode-book"
  | "tome-song"
  | "karaoke"
  | "papers"
  | "size"
  | "host"
  | "search"
  | "filters"
  | "hat"
  | "speech"
  | "pick"
  | "collapse";

type Dir = "down" | "up" | "left" | "right";

const COPY: Record<HintId, { kicker: string; text: string }> = {
  screen: {
    kicker: "Экран",
    text: "Кадр — дверь в мир. Жми его. Точки внизу листают сеанс.",
  },
  popcorn: {
    kicker: "Попкорн",
    text: "Это не еда. Попкорн здесь — донат на сеанс.",
  },
  shards: {
    kicker: "Осколок",
    text: "Вещь из мира. Жми — откроется дом, откуда она её унесла.",
  },
  pin: {
    kicker: "Значок",
    text: "В углу карточки осколок мира. Сама карточка открывает дом.",
  },
  whisper: {
    kicker: "Люси",
    text: "Лицо в углу — она. Жми, если нужна короткая реплика.",
  },
  "mode-book": {
    kicker: "Книга",
    text: "Музыка и глава — разные кнопки. Жми «Книга», если хочешь слушать, как она читает.",
  },
  "tome-song": {
    kicker: "Песня тома",
    text: "Это музыка тома, не голос главы. Голос включается кнопкой «Книга» в плеере.",
  },
  karaoke: {
    kicker: "Караоке",
    text: "Буквы загораются за её голосом. Жми, если хочешь следить. Выключается так же.",
  },
  papers: {
    kicker: "Бумага",
    text: "Ночь, сепия, бумага, день — только цвет страницы. Глава та же.",
  },
  size: {
    kicker: "Буквы",
    text: "А, Аа, Ааа — крупнее текст. Смысл не меняется.",
  },
  host: {
    kicker: "Площадки",
    text: "Те же записи на разных полках. Если одна молчит, жми другую.",
  },
  search: {
    kicker: "Поиск",
    text: "Ищет запись на выбранной площадке. Площадка — кнопки выше.",
  },
  filters: {
    kicker: "Полки",
    text: "Миры, лица, шапка, книга — полки одной галереи, не разные сайты.",
  },
  hat: {
    kicker: "Шапка",
    text: "Жми фото — следующее. Цифры под ним листают то же.",
  },
  speech: {
    kicker: "Речь",
    text: "Сначала распакуй архив. Из самого zip программа не стартует.",
  },
  pick: {
    kicker: "Список",
    text: "Длинная кнопка открывает альбом или главу. Это не «играть».",
  },
  collapse: {
    kicker: "Плеер",
    text: "Сел на текст. Стрелка вниз прячет его. Вернётся маленькой закладкой.",
  },
};

const ORDER: HintId[] = [
  "screen",
  "popcorn",
  "shards",
  "pin",
  "whisper",
  "mode-book",
  "tome-song",
  "karaoke",
  "papers",
  "size",
  "host",
  "search",
  "filters",
  "hat",
  "speech",
  "pick",
  "collapse",
];

const VIEWS: Partial<Record<HintId, string[]>> = {
  screen: ["home"],
  popcorn: ["home"],
  shards: ["home", "worlds"],
  pin: ["worlds"],
  whisper: ["home", "lucy"],
  "mode-book": ["book", "read"],
  "tome-song": ["book"],
  karaoke: ["read"],
  papers: ["read"],
  size: ["read"],
  host: ["world", "streams"],
  search: ["streams"],
  filters: ["gallery"],
  hat: ["shop"],
  speech: ["programs"],
  pick: ["music"],
};

const STORE = "ghostpot-led";

function readDone(): Partial<Record<HintId, true>> {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE) || "{}");
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

function writeDone(id: HintId) {
  const next = { ...readDone(), [id]: true };
  localStorage.setItem(STORE, JSON.stringify(next));
  return next;
}

function targetOf(id: HintId) {
  return document.querySelector<HTMLElement>(`[data-led="${id}"]`);
}

function eligible(viewName: string, scrolled: boolean, done: Partial<Record<HintId, true>>): HintId | null {
  for (const id of ORDER) {
    if (done[id]) continue;
    const views = VIEWS[id];
    if (views && !views.includes(viewName)) continue;
    if (id === "collapse" && !scrolled) continue;
    const node = targetOf(id);
    if (!node) continue;
    if (id === "mode-book" && node.getAttribute("data-on") === "true") continue;
    if (id === "karaoke" && (node.getAttribute("aria-pressed") === "true" || node.getAttribute("data-on") === "true")) continue;
    return id;
  }
  return null;
}

function layout(rect: DOMRect): { dir: Dir; left: number; top: number } {
  const plateW = 248;
  const plateH = 136;
  const arrow = 46;
  const pad = 10;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const clamp = (value: number, max: number) => Math.min(Math.max(value, pad), Math.max(pad, max));
  const center = rect.left + rect.width / 2 - plateW / 2;
  if (rect.top > plateH + arrow + pad) {
    return { dir: "down", left: clamp(center, vw - plateW - pad), top: rect.top - plateH - arrow - 6 };
  }
  if (vh - rect.bottom > plateH + arrow + pad) {
    return { dir: "up", left: clamp(center, vw - plateW - pad), top: rect.bottom + 8 };
  }
  if (rect.left > plateW + arrow + pad) {
    return {
      dir: "right",
      left: rect.left - plateW - arrow - 6,
      top: clamp(rect.top + rect.height / 2 - plateH / 2, vh - plateH - pad),
    };
  }
  return { dir: "left", left: rect.right + 8, top: clamp(rect.top + rect.height / 2 - plateH / 2, vh - plateH - pad) };
}

export function LedHints({ viewName }: { viewName: string }) {
  const [done, setDone] = useState<Partial<Record<HintId, true>>>({});
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<HintId | null>(null);
  const activeRef = useRef<HintId | null>(null);
  activeRef.current = active;
  const [box, setBox] = useState<{ dir: Dir; left: number; top: number } | null>(null);

  useEffect(() => {
    setDone(readDone());
  }, []);

  useEffect(() => {
    setScrolled(false);
  }, [viewName]);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 160) setScrolled(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [viewName]);

  useEffect(() => {
    let timer = 0;
    const finishIfUsed = () => {
      const current = readDone();
      (["mode-book", "karaoke"] as HintId[]).forEach((id) => {
        if (current[id]) return;
        const node = targetOf(id);
        if (!node) return;
        const used =
          id === "karaoke"
            ? node.getAttribute("aria-pressed") === "true" || node.getAttribute("data-on") === "true"
            : node.getAttribute("data-on") === "true";
        if (used) current[id] = true;
      });
      if (JSON.stringify(current) !== JSON.stringify(readDone())) {
        localStorage.setItem(STORE, JSON.stringify(current));
        setDone({ ...current });
      }
    };
    const tick = () => {
      finishIfUsed();
      const next = eligible(viewName, scrolled, readDone());
      setActive((prev) => (prev === next ? prev : next));
    };
    const onChange = (event: Event) => {
      const hit = event.target instanceof Element ? event.target.closest("[data-led]") : null;
      const id = hit?.getAttribute("data-led");
      if (id && id === activeRef.current && id in COPY) setDone(writeDone(id as HintId));
      tick();
      window.setTimeout(tick, 90);
    };
    timer = window.setTimeout(tick, 700);
    let wait = 0;
    const later = () => {
      window.clearTimeout(wait);
      wait = window.setTimeout(tick, 180);
    };
    const seen = new MutationObserver(later);
    seen.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-on", "aria-pressed"] });
    window.addEventListener("click", onChange);
    window.addEventListener("resize", onChange);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(wait);
      seen.disconnect();
      window.removeEventListener("click", onChange);
      window.removeEventListener("resize", onChange);
    };
  }, [viewName, scrolled, done]);

  useEffect(() => {
    if (!active) {
      setBox(null);
      document.querySelectorAll("[data-led-hot]").forEach((node) => node.removeAttribute("data-led-hot"));
      return;
    }
    const place = () => {
      const node = targetOf(active);
      if (!node) {
        setBox(null);
        return;
      }
      node.setAttribute("data-led-hot", "1");
      document.querySelectorAll("[data-led-hot]").forEach((other) => {
        if (other !== node) other.removeAttribute("data-led-hot");
      });
      setBox(layout(node.getBoundingClientRect()));
    };
    place();
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place);
      window.removeEventListener("resize", place);
    };
  }, [active]);

  if (!active || !box) return null;
  const copy = COPY[active];
  const dismiss = () => setDone(writeDone(active));

  return (
    <div className="led-hint" data-dir={box.dir} style={{ left: box.left, top: box.top }} role="note">
      <div className="led-plate">
        <b>Люси · {copy.kicker}</b>
        <p>{copy.text}</p>
        <button type="button" className="led-x" aria-label="Скрыть подсказку" onClick={dismiss}>
          ×
        </button>
      </div>
      <div className="led-arrow" aria-hidden="true">
        <i style={{ ["--i" as string]: 0 }} />
        <i style={{ ["--i" as string]: 1 }} />
        <i style={{ ["--i" as string]: 2 }} />
        <i style={{ ["--i" as string]: 3 }} />
        <i style={{ ["--i" as string]: 4 }} />
        <span className="led-chev" />
      </div>
    </div>
  );
}
