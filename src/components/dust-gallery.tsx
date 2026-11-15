import { useEffect, useRef } from "react";

const FRAMES = [
  { src: "/brand/slides/rangers.webp", alt: "Space Rangers. Корабль и тишина." },
  { src: "/brand/slides/gothic.webp", alt: "Готика. Колония под куполом." },
  { src: "/brand/slides/calradia.webp", alt: "Кальрадия. Степь и чужие знамёна." },
  { src: "/brand/slides/azeroth.webp", alt: "Азерот. Жрица у портала." },
  { src: "/brand/slides/zomboid.webp", alt: "Project Zomboid. Ночь без сейва." },
  { src: "/brand/slides/kenshi.webp", alt: "Кенши. Кандалы сняты." },
  { src: "/brand/slides/fallout.webp", alt: "Fallout. Одна пустошь." },
  { src: "/brand/slides/nito3.webp", alt: "Ни то. Окно и автобус." }
];

const TILE = 14;

type Frame = { src: string; alt: string };
type Loaded = Frame & { img: HTMLImageElement; ready: boolean };

export function DustGallery({ onOpen }: { onOpen: (item: Frame) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    const images: Loaded[] = FRAMES.map(frame => {
      const img = new Image();
      img.src = frame.src;
      return { ...frame, img, ready: false };
    });
    images.forEach(item => {
      item.img.onload = () => {
        item.ready = true;
      };
    });

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let scroll = 0;
    let velocity = reduce ? 0 : 0.35;
    let dragging = false;
    let moved = 0;
    let lastX = 0;
    let frame = 0;
    let alive = true;

    const size = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return rect;
    };
    size();
    const onResize = () => size();
    window.addEventListener("resize", onResize);

    const edge = (x, width) => {
      const zone = width * 0.22;
      return Math.min(1, Math.max(0, Math.min(x, width - x) / zone));
    };

    const drawTiles = (img, cardX, cardY, cardW, cardH, from, to, width) => {
      const srcW = img.naturalWidth;
      const srcH = img.naturalHeight;
      for (let x = from; x < to; x += TILE) {
        const f = edge(x + TILE / 2, width);
        if (f > 0.97) continue;
        const scatter = (1 - f) ** 1.7;
        const col = Math.round(x);
        const dir = x < width / 2 ? -1 : 1;
        for (let y = cardY; y < cardY + cardH; y += TILE) {
          const row = Math.round(y);
          const n = Math.sin(col * 12.9898 + row * 78.233) * 43758.5453;
          const noise = n - Math.floor(n) - 0.5;
          const alpha = f ** 0.55;
          if (alpha < 0.03) continue;
          const dx = dir * scatter * 78 + noise * scatter * 30;
          const dy = noise * scatter * 46;
          const dw = TILE * (1 - scatter * 0.45);
          ctx.globalAlpha = alpha;
          ctx.drawImage(
            img,
            (x - cardX) / cardW * srcW,
            (y - cardY) / cardH * srcH,
            TILE / cardW * srcW,
            TILE / cardH * srcH,
            x + dx,
            y + dy,
            dw,
            dw
          );
        }
      }
    };

    const tick = () => {
      if (!alive) return;
      frame = requestAnimationFrame(tick);
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      if (!dragging) scroll += velocity;
      velocity = dragging ? velocity : velocity * 0.96 + (reduce ? 0 : 0.35) * 0.04;

      const cardH = Math.min(height * 0.78, 520);
      const cardW = cardH * 1.45;
      const gap = 18;
      const step = cardW + gap;
      const loop = step * images.length;
      scroll = (scroll % loop + loop) % loop;
      const cardY = (height - cardH) / 2;
      const zone = width * 0.22;

      ctx.globalAlpha = 1;
      ctx.fillStyle = "#070605";
      ctx.fillRect(0, 0, width, height);

      let nearest = null;
      let nearestDist = Infinity;
      images.forEach((item, index) => {
        if (!item.ready) return;
        let cardX = ((index * step - scroll) % loop + loop) % loop;
        if (cardX > width) cardX -= loop;
        if (cardX > width + 40 || cardX + cardW < -40) return;
        const mid = cardX + cardW / 2;
        const dist = Math.abs(mid - width / 2);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = item;
        }
        const solidL = Math.max(cardX, zone);
        const solidR = Math.min(cardX + cardW, width - zone);
        if (solidR - solidL > 1) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(solidL, cardY, solidR - solidL, cardH);
          ctx.clip();
          ctx.globalAlpha = 1;
          ctx.drawImage(item.img, cardX, cardY, cardW, cardH);
          ctx.restore();
        }
        if (!reduce) {
          if (cardX < zone) drawTiles(item.img, cardX, cardY, cardW, cardH, cardX, Math.min(cardX + cardW, zone), width);
          if (cardX + cardW > width - zone) drawTiles(item.img, cardX, cardY, cardW, cardH, Math.max(cardX, width - zone), cardX + cardW, width);
        } else if (solidR - solidL <= 1) {
          ctx.globalAlpha = 1;
          ctx.drawImage(item.img, cardX, cardY, cardW, cardH);
        }
      });
      if (labelRef.current && nearest && labelRef.current.textContent !== nearest.alt) {
        labelRef.current.textContent = nearest.alt;
      }
    };
    frame = requestAnimationFrame(tick);

    const pointerDown = event => {
      dragging = true;
      moved = 0;
      lastX = event.clientX;
      velocity = 0;
      canvas.setPointerCapture?.(event.pointerId);
    };
    const pointerMove = event => {
      if (!dragging) return;
      const dx = event.clientX - lastX;
      lastX = event.clientX;
      moved += Math.abs(dx);
      scroll -= dx;
      velocity = -dx;
    };
    const pointerUp = event => {
      if (!dragging) return;
      dragging = false;
      if (moved > 8) return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const cardH = Math.min(rect.height * 0.78, 520);
      const cardW = cardH * 1.45;
      const gap = 18;
      const step = cardW + gap;
      const loop = step * images.length;
      const cardY = (rect.height - cardH) / 2;
      if (y < cardY || y > cardY + cardH) return;
      const local = (x + (scroll % loop) + loop) % loop;
      const index = Math.floor(local / step);
      if (local - index * step > cardW) return;
      const item = images[index];
      if (item) onOpen({ src: item.src, alt: item.alt });
    };
    canvas.addEventListener("pointerdown", pointerDown);
    canvas.addEventListener("pointermove", pointerMove);
    canvas.addEventListener("pointerup", pointerUp);
    canvas.addEventListener("pointercancel", pointerUp);

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointermove", pointerMove);
      canvas.removeEventListener("pointerup", pointerUp);
      canvas.removeEventListener("pointercancel", pointerUp);
    };
  }, [onOpen]);

  return <div className="dust"><canvas ref={canvasRef} aria-label="Лента путешествий Люси" /><p className="dust-label" ref={labelRef}>Путь между мирами</p><p className="dust-hint">Потяни. У края кадр рассыпается.</p></div>;
}
