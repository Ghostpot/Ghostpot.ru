import { useEffect, useState } from "react";
import { worlds } from "@/data/content";
import { getLive, type LiveReport } from "@/lib/live";

export function LiveBadge() {
  const world = worlds.find((item) => item.mark === "Сейчас")?.name ?? "PROJECT ZOMBOID";
  const [report, setReport] = useState<LiveReport | null>(null);

  useEffect(() => {
    let live = true;
    const load = () => {
      if (document.hidden) return;
      getLive()
        .then((data) => {
          if (live) setReport(data);
        })
        .catch(() => {
          if (live) setReport({ hits: [] });
        });
    };
    load();
    const timer = window.setInterval(load, 15 * 60 * 1000);
    const onShow = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", onShow);
    return () => {
      live = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, []);

  const hits = report?.hits ?? [];
  const hit = hits[0];
  if (hit) {
    return (
      <a className="live is-on" href={hit.href} title={hit.title}>
        <i />
        <span>
          <span>Сейчас в эфире · {hits.map((item) => item.platform).join(", ")}</span>
          <b>{hit.game || hit.title}</b>
        </span>
      </a>
    );
  }

  return (
    <button
      className="live is-off"
      type="button"
      onClick={() => {
        window.location.hash = `#world=${encodeURIComponent(world)}`;
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      <i />
      <span>
        <span>{report ? "Эфир не идёт" : "Проверяю площадки"}</span>
        <b>В мире: {world}</b>
      </span>
    </button>
  );
}
