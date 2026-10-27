import { useEffect, useState } from "react";
import { nights } from "@/data/content";
import { getAir, type AirItem } from "@/lib/air";

function when(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const clock = date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const day = new Date(now);
  day.setHours(0, 0, 0, 0);
  const that = new Date(date);
  that.setHours(0, 0, 0, 0);
  const diff = Math.round((day.getTime() - that.getTime()) / 86400000);
  if (diff === 0) return `сегодня · ${clock}`;
  if (diff === 1) return `вчера · ${clock}`;
  const stamp = date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  return `${stamp} · ${clock}`;
}

export function AirFeed() {
  const [items, setItems] = useState<AirItem[] | null>(null);

  useEffect(() => {
    let live = true;
    getAir()
      .then((data) => {
        if (live) setItems(data);
      })
      .catch(() => {
        if (live) setItems([]);
      });
    return () => {
      live = false;
    };
  }, []);

  if (items === null) return <p className="meta">Смотрю свежие эфиры.</p>;

  const cutoff = Date.now() - 3 * 86400000;
  const recent = items.filter((item) => new Date(item.at).getTime() >= cutoff);
  const shown = (recent.length ? recent : items).slice(0, 6);

  if (!shown.length) {
    return (
      <div className="air-row">
        {nights.slice(0, 6).map((night) => (
          <p key={night.when} className="air-card">
            <b>{night.where}</b>
            <span className="meta">{night.when}</span>
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className="air-row">
      {shown.map((item) => (
        <a key={item.id} className="air-card" href={item.href} target="_blank" rel="noreferrer">
          <img src={item.thumb} alt="" />
          <span className="meta">{when(item.at)}</span>
          <b>{item.title}</b>
        </a>
      ))}
    </div>
  );
}
