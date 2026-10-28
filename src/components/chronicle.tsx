// Recovered from the production bundle after a bad edit. Behavior matches the last deploy.
// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { BookBar } from "@/components/book-bar";
import { BookProse } from "@/components/book-prose";
import { PlayerBar } from "@/components/player-bar";
import { Shot, markHot } from "@/components/ui";
import { catalog, channels, chapterIndex, hatShots, links, lucySongs, passport, skills, videoCount, volumes, worlds } from "@/data/content";
import { guideForWorld, guides } from "@/data/guides";
import { loadChapters, loadVideos, platesOf } from "@/data/load";
import { useBookAudio } from "@/lib/book-audio";
import { LedHints } from "@/components/led-hints";
import { AirFeed } from "@/components/air-feed";
import { LiveBadge } from "@/components/live-badge";
import { ShardPin, ShardPlate, ShardVault } from "@/components/shards";
import { usePlayer } from "@/lib/player-store";

export type View =
  | { name: "home" }
  | { name: "world"; id: string }
  | { name: "read"; id: string }
  | { name: "worlds" }
  | { name: "book" }
  | { name: "music" }
  | { name: "gallery" }
  | { name: "shop" }
  | { name: "lucy" }
  | { name: "streams" }
  | { name: "programs" }
  | { name: "about" }
  | { name: "law" };

var NAV = [{
  id: "home",
  label: "Главная"
}, {
  id: "worlds",
  label: "Миры"
}, {
  id: "book",
  label: "Книга"
}, {
  id: "music",
  label: "Музыка"
}, {
  id: "gallery",
  label: "Галерея"
}, {
  id: "shop",
  label: "Шапка"
}, {
  id: "lucy",
  label: "Люси"
}, {
  id: "streams",
  label: "Эфиры"
}, {
  id: "programs",
  label: "Программы"
}, {
  id: "about",
  label: "Обо мне"
}];
export function parseHash(): View {
  const raw = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  if (!raw || raw === "home") return {
    name: "home"
  };
  if (raw.startsWith("world=")) return {
    name: "world",
    id: raw.slice(6)
  };
  if (raw.startsWith("read=")) return {
    name: "read",
    id: raw.slice(5)
  };
  const known = NAV.map(item => item.id);
  if (raw === "law" || known.includes(raw)) return {
    name: raw
  };
  return {
    name: "home"
  };
}
function hrefFor(view) {
  if (view.name === "world") return `#world=${encodeURIComponent(view.id)}`;
  if (view.name === "read") return `#read=${encodeURIComponent(view.id)}`;
  if (view.name === "home") return "#home";
  return `#${view.name}`;
}
function readPlace() {
  try {
    const raw = localStorage.getItem("ghostpot-place");
    if (!raw) return null;
    const place = JSON.parse(raw);
    if (!place.id) return null;
    return {
      id: place.id,
      y: place.y ?? 0
    };
  } catch {
    return null;
  }
}
function savePlace(id, y) {
  localStorage.setItem("ghostpot-place", JSON.stringify({
    id,
    y
  }));
}
function Here() {
  return <Bookmark className="here" size={14} aria-label="Здесь ты остановился" />;
}
var leaveSite = null;
export function openSite(hash) {
  const clean = hash.replace(/^#/, "");
  if (window.location.pathname !== "/" && leaveSite) {
    leaveSite(clean);
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
    return;
  }
  if (window.location.pathname !== "/") {
    window.location.assign(`/#${clean}`);
    return;
  }
  window.location.hash = `#${clean}`;
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}
function go(view) {
  openSite(hrefFor(view).replace(/^#/, ""));
}
export function Shell({
  view,
  guides = false,
  children
}) {
  const router = useRouter();
  useEffect(() => {
    leaveSite = hash => {
      router.navigate({
        to: "/",
        hash
      });
    };
    return () => {
      leaveSite = null;
    };
  }, [router]);
  return <div className="app"><LedHints viewName={view.name} /><div className="embers" aria-hidden="true">{Array.from({
        length: 14
      }, (_, index) => <span key={index} className="ember" style={{
        left: `${index * 7.3 % 100}%`,
        animationDuration: `${11 + index % 6 * 2.2}s`,
        animationDelay: `${index * .7}s`,
        opacity: .25 + index % 4 * .1
      }} />)}</div><header className="topbar"><button className="brand" type="button" onClick={() => go({
        name: "home"
      })} aria-label="Ghostpot, на главную"><img src="/brand/ghostpot-word.webp" alt="Ghostpot" width="1280" height="401" /></button><nav className="nav" aria-label="Разделы сайта">{NAV.map(item => <button key={item.id} type="button" data-on={view.name === item.id || item.id === "worlds" && view.name === "world" || item.id === "book" && view.name === "read"} onClick={() => go({
          name: item.id
        })}>{item.label}</button>)}<Link to="/guides" data-on={guides ? "true" : void 0}>Гайды</Link></nav></header><main className="stage"><div key={view.name === "read" ? `read-${"id" in view ? view.id : ""}` : view.name === "world" ? view.id : view.name} className="view">{children}</div></main><BookBar /><PlayerBar /><footer className="foot"><button className="foot-brand" type="button" onClick={() => go({
        name: "home"
      })} aria-label="Ghostpot, на главную"><img src="/brand/ghostpot-word.webp" alt="Ghostpot" width="1280" height="401" /></button><p>18+ · игровые эфиры. Ghostpot · хостинг в Российской Федерации.</p><p><button type="button" onClick={() => go({
          name: "law"
        })}>Политика, соглашение, cookie</button> · <Link to="/guides">Гайды</Link> · <a href={links.mail}>{links.email}</a> · <a href={links.telegram}>Telegram</a> · <a href={links.max}>MAX</a></p><p>Персональные данные россиян на сайт не собираются. Место в книге и громкость остаются в браузере.</p></footer></div>;
}
function WorldCard({
  world,
  featured = false
}) {
  const songs = world.tracks.filter(track => track.src).length;
  return <button className={`world-card ${featured ? "feature" : ""}`} type="button" onClick={() => go({
    name: "world",
    id: world.name
  })} onPointerEnter={() => void loadVideos()}><div className="card-media"><Shot src={world.cover} alt="" /><span className="badge" data-hot={markHot(world.mark)}>{world.mark}</span><ShardPin world={world.name} /></div><div className="card-body"><div className="album">{world.album}</div><h3>{world.name}</h3><p className={featured ? "" : "clamp"}>{world.game}</p><p className="clamp">{world.lived}</p><div className="meta">{songs ? `${songs} ${songs === 1 ? "песня" : songs < 5 ? "песни" : "песен"}` : "песни ещё в пути"} · {videoCount(world.name)} записей</div></div></button>;
}
var ARRIVALS = ["В зал вошли двое и сели ближе к проходу.", "Кто-то встал и вышел за попкорном.", "В третьем ряду освободилось место.", "Ещё один зритель сел на этот сеанс.", "Из фойе вернулись. Свет уже гаснет."];
var SLIDES = [{
  src: "/brand/slides/gothic.webp",
  world: "Готика",
  line: "Колония под куполом. Она только очнулась."
}, {
  src: "/brand/slides/calradia.webp",
  world: "Кальрадия",
  line: "Степь, щит и чужие знамёна."
}, {
  src: "/brand/slides/azeroth.webp",
  world: "Азерот",
  line: "Жрица. Эльфийские уши только здесь."
}, {
  src: "/brand/slides/zomboid.webp",
  world: "PROJECT ZOMBOID",
  line: "Ночь без сейва. Копьё у костра."
}, {
  src: "/brand/slides/kenshi.webp",
  world: "Кенши",
  line: "Кандалы сняты. За барханом — дом."
}, {
  src: "/brand/slides/fallout.webp",
  world: "Fallout",
  line: "Одна пустошь. Пустая миска."
}];
export function HomeView() {
  const play = usePlayer(s => s.play);
  const featured = worlds.filter(world => world.live);
  const rest = worlds.filter(world => !world.live);
  const [beat, setBeat] = useState(0);
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setBeat(value => (value + 1) % ARRIVALS.length), 4600);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    const timer = window.setInterval(() => setSlide(value => (value + 1) % SLIDES.length), 6500);
    return () => window.clearInterval(timer);
  }, []);
  const frame = SLIDES[slide];
  return <><section className="hall" aria-label="Кинозал Ghostpot"><div className="theater"><img className="theater-bg" src="/brand/slides/hall.webp" alt="" fetchPriority="high" decoding="async" /><div className="theater-screen" data-led="screen" aria-roledescription="карусель" aria-label="Эпизоды Люси">{SLIDES.map((item, index) => {
            const last = (slide + SLIDES.length - 1) % SLIDES.length;
            const next = (slide + 1) % SLIDES.length;
            const visible = index === slide || index === next || slide !== 0 && index === last;
            return <button key={item.world} className="theater-frame" type="button" data-on={index === slide} onClick={() => go({
              name: "world",
              id: item.world
            })} aria-label={`${item.world}. ${item.line}`}>{visible ? <img src={item.src} alt="" decoding="async" fetchPriority={index === slide ? "high" : "low"} /> : null}</button>;
          })}<div className="screen-card"><p className="screen-kicker">Сейчас на экране</p><p className="screen-film">{frame.world}</p><p className="screen-line">{frame.line}</p></div><div className="theater-dots">{SLIDES.map((item, index) => <button key={item.world} type="button" data-on={index === slide} aria-label={item.world} onClick={() => setSlide(index)} />)}</div></div><p className="arrival" aria-live="polite">{ARRIVALS[beat]}</p><a className="popcorn" data-led="popcorn" href={links.boosty}><span className="bucket" aria-hidden="true" /><span>Купить попкорн<small>донат на сеанс</small></span></a></div><aside className="bill"><p className="bill-side">13 игр · одна героиня</p><div><p className="kicker">Кино и игра</p><h2><em>Игра</em> стала сеансом</h2><p className="below">Ниже: миры, книга, музыка</p><p className="lead">Люси живёт внутри игр. Фэнтези, техника и магия для неё не партия, а дом: ест, поёт, снимает блог, убивает, любит. Мир отпускает, только когда миссия закрыта. В следующем она начинает с нуля. У неё одно лицо, рысьи уши и рост 172.</p><p className="lead">Ты сидишь на этом стриме. Ghostpot — эфиры Николая Чичкань.</p><div className="roles"><article><b>Играет</b><span>миры, в которых она жила</span></article><article><b>Читает</b><span>книгу пути между играми</span></article><article><b>В зале</b><span>стрим, пока сеанс идёт</span></article></div><div className="actions"><a className="solid" href={links.twitch}>Смотреть стрим</a><button className="ghost" type="button" onClick={() => go({
              name: "worlds"
            })}>Миры</button><button className="ghost" type="button" onClick={() => go({
              name: "book"
            })} onPointerEnter={() => void loadChapters()}>Читать книгу</button><a className="ghost" href={links.alerts}>Ещё на чай</a><LiveBadge /></div><p className="kicker" style={{
            marginTop: "0.9rem"
          }}>Подписаться</p><div className="subs">{channels.map(channel => <a key={channel.href} href={channel.href} rel="noreferrer">{channel.name}</a>)}</div></div></aside></section><section className="section"><header><div><h2>Миры Люси</h2><p className="sub">Картины одного героя. Карточка — дом. Значок в углу — осколок, который она оттуда унесла.</p></div><button className="ghost" type="button" onClick={() => go({
          name: "worlds"
        })}>Все миры</button></header><div className="grid-2" style={{
        marginTop: "1rem"
      }}>{featured.map(world => <WorldCard key={world.name} world={world} featured={true} />)}</div><div className="world-grid" style={{
        marginTop: "0.9rem"
      }}>{rest.map(world => <WorldCard key={world.name} world={world} />)}</div></section><ShardVault onOpen={id => go({
        name: "world",
        id
      })} /><section className="section"><header><div><h2>Гайды по пройденным мирам</h2><p className="sub">Картинки миров и шорты с эфира. Электроника пустоши, Кентукки, колония.</p></div><Link className="ghost" to="/guides">Все гайды</Link></header><div className="guide-list">{guides.map(guide => <Link key={guide.slug} className="guide-card" to="/guides/$slug" params={{
          slug: guide.slug
        }}><img src={guide.cover} alt="" /><span className="guide-copy"><span className="meta">{guide.game}</span><b>{guide.h1}</b></span></Link>)}</div></section><section className="section grid-2"><article className="panel"><p className="kicker">Музыка</p><h2>Песни, плейлисты, атмосфера.</h2><div className="cover" style={{
          margin: "1rem 0",
          maxWidth: 280
        }}><Shot src="/chronicle/music/gothic.jpg" alt="Обложка колонии" /></div>{catalog.slice(0, 5).map((track, index) => <button key={track.src} className="track" type="button" onClick={() => play(track, catalog)}><span className="idx">{index + 1}</span><span><b>{track.title}</b><em>{track.world}</em></span><span className="time">{track.length}</span></button>)}<button className="ghost" type="button" onClick={() => go({
          name: "music"
        })}>Слушать песни</button></article><article className="panel"><p className="kicker">Книга</p><h2>Моя история. От первого мира до сейчас.</h2><div className="cover" style={{
          margin: "1rem 0",
          maxWidth: 220
        }}><Shot src="/brand/book.webp" alt="Люси. Обложка тома." /></div><p>Это не просто книга. Это моя жизнь. Мои миры. Мои ошибки и победы.</p><p className="meta">{chapterIndex.length} глав · пролог и три тома, от холода на камнях до партии у портала.</p><button className="solid" type="button" onClick={() => go({
          name: "read",
          id: "prolog"
        })} onPointerEnter={() => void loadChapters()}>Читать книгу</button></article></section><section className="section"><header><div><h2>Последние ночи</h2></div><button className="quiet" type="button" onClick={() => go({
          name: "streams"
        })}>Все записи</button></header><AirFeed /></section><section className="section"><article className="panel"><div className="row"><div className="disc"><Shot src="/brand/nikolay.webp" alt="Николай, Ghostpot." /></div><div><h2>Николай</h2><p className="script" style={{
              fontSize: "1.4rem"
            }}>40 уровень</p></div></div><p>Класс: ночной эфир. Люси на экране, он за клавиатурой.</p>{skills.map(skill => <div key={skill.name} className="skill" style={{
          marginBottom: "0.4rem"
        }}><b>{skill.name}</b><div className="meta">{skill.note}</div></div>)}<div className="actions"><button className="ghost" type="button" onClick={() => go({
            name: "about"
          })}>Обо мне</button><a className="ghost" href={links.mail}>Написать</a></div></article></section><section className="section panel" style={{
      display: "grid",
      gap: "0.8rem"
    }}><div className="grid-2" style={{
        alignItems: "center"
      }}><figure className="still"><Shot src="/brand/hungry.webp" alt="Люси с пустой миской." /><figcaption>Кадр · пустая миска</figcaption></figure><div><h2>Поддержать Ghostpot</h2><p className="script" style={{
            fontSize: "1.55rem",
            marginTop: "0.6rem"
          }}>Отец родной, добавь на чай. На меня ты не серчай: я тут собрал всё для тебя. Бесплатно, может, и нехотя. Если можешь — поддержи. Сюда.</p><div className="actions"><a className="solid" href={links.boosty}>Boosty</a><a className="ghost" href={links.alerts}>DonationAlerts</a></div></div></div></section></>;
}
export function WorldsView() {
  return <section><p className="kicker">Репертуар зала</p><h1 className="script" style={{
      fontSize: "clamp(3rem, 8vw, 5.5rem)",
      color: "var(--color-parchment)"
    }}>Все миры</h1><p className="lead">Она входит в хардкорный мир с миссией. Мир принимает её как свою: не гостья — будто она всегда тут жила. То же лицо. Те же уши. Новое тело. Когда миссия закрыта или тело больше не держит — душа уходит. Следующий мир. Снова «своя с рождения».</p><ShardVault onOpen={id => go({
      name: "world",
      id
    })} /><div className="world-grid" style={{
      marginTop: "1.2rem"
    }}>{worlds.map(world => <WorldCard key={world.name} world={world} />)}</div></section>;
}
function mirrorOf(href) {
  const host = href.toLowerCase();
  if (host.includes("rutube.ru")) return "rutube";
  if (host.includes("vk.com") || host.includes("vkvideo") || host.includes("vk.ru")) return "vk";
  if (host.includes("youtube.com") || host.includes("youtu.be")) return "youtube";
  return null;
}
function embedOf(href) {
  let url;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  const host = mirrorOf(href);
  if (host === "youtube") {
    let id = url.searchParams.get("v");
    if (url.hostname.endsWith("youtu.be")) id = url.pathname.split("/").filter(Boolean)[0] ?? null;
    const shorts = url.pathname.match(/\/shorts\/([^/?]+)/);
    if (shorts) id = shorts[1];
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "rutube") {
    const parts = url.pathname.split("/").filter(Boolean);
    const id = parts[0] === "video" ? parts[1] : null;
    return id ? `https://rutube.ru/play/embed/${id}` : null;
  }
  if (host === "vk") {
    const match = href.match(/video(-?\d+)_(\d+)/);
    if (!match) return null;
    return `https://vk.com/video_ext.php?oid=${match[1]}&id=${match[2]}&hd=2`;
  }
  return null;
}
function listsOn(lists, host) {
  return lists.map(list => ({
    ...list,
    videos: list.videos.filter(video => mirrorOf(video.href) === host)
  })).filter(list => list.videos.length);
}
function useVideos() {
  const [data, setData] = useState(null);
  useEffect(() => {
    let live = true;
    loadVideos().then(lists => {
      if (live) setData(lists);
    });
    return () => {
      live = false;
    };
  }, []);
  return data;
}
export function WorldView({
  id
}) {
  const world = worlds.find(item => item.name === id) ?? worlds[0];
  const videos = useVideos();
  const lists = videos?.[world.name] ?? [];
  const [open, setOpen] = useState(false);
  const [host, setHost] = useState("youtube");
  const [clip, setClip] = useState(null);
  const play = usePlayer(s => s.play);
  const songs = world.tracks.filter(track => track.src).map(track => ({
    title: track.title,
    world: world.name,
    src: track.src,
    cover: world.cover,
    length: track.length,
    note: track.note ?? ""
  }));
  const shelf = listsOn(lists, host);
  const shown = open ? shelf : shelf.map(list => ({
    ...list,
    videos: list.videos.slice(0, 3)
  }));
  const more = shelf.some(list => list.videos.length > 3);
  useEffect(() => {
    setHost("youtube");
    setClip(null);
    setOpen(false);
  }, [id]);
  function choose(next) {
    setHost(next);
    setOpen(false);
    const first = lists.flatMap(list => list.videos).find(video => mirrorOf(video.href) === next);
    setClip(first ? embedOf(first.href) : null);
  }
  function watch(video) {
    setClip(embedOf(video.href));
  }
  return <article><button className="quiet" type="button" onClick={() => go({
      name: "worlds"
    })}>← Все миры</button><div className="grid-2" style={{
      marginTop: "0.8rem",
      alignItems: "start"
    }}><div className="cover" style={{
        maxWidth: 460
      }}><Shot src={world.cover} alt={world.name} /></div><div><p className="kicker">{world.mark} · {world.album}</p><h1 style={{
          fontSize: "clamp(3rem, 7vw, 5.2rem)"
        }}>{world.name}</h1><p className="lead">{world.text}</p><ShardPlate world={world.name} /><div className="actions">{songs[0] ? <button className="solid" type="button" onClick={() => play(songs[0], songs)}>Слушать альбом</button> : null}{guideForWorld(world.name) ? <Link className="ghost" to="/guides/$slug" params={{
            slug: guideForWorld(world.name).slug
          }}>Гайд по миру</Link> : null}<a className="ghost" href={links.twitch}>Смотреть стрим</a></div></div></div><section className="section grid-2"><article className="panel"><h2>Какой это мир</h2><p>{world.game}</p></article><article className="panel"><h2>Как там жила Люси</h2><p>{world.lived}</p></article></section>{songs.length ? <section className="section album-compact"><header><h2>Альбом «{world.album}»</h2><span className="meta">{songs.length} {songs.length === 1 ? "песня" : songs.length < 5 ? "песни" : "песен"}</span></header><div className="track-list">{songs.map((track, index) => <button key={track.src} className="track slim" type="button" onClick={() => play(track, songs)}><span className="idx">{index + 1}</span><b>{track.title}</b><span className="time">{track.length}</span></button>)}</div></section> : <p className="section meta">Песни этого заезда ещё не выложены. Записи эфиров — ниже.</p>}<section className="section"><header><h2>Записи</h2><div className="actions" data-led="host"><button className="ghost" type="button" data-on={host === "youtube"} onClick={() => choose("youtube")}>YouTube</button><button className="ghost" type="button" data-on={host === "rutube"} onClick={() => choose("rutube")}>RuTube</button><button className="ghost" type="button" data-on={host === "vk"} onClick={() => choose("vk")}>VK Видео</button></div></header><p className="meta">Та же полка на странице. RuTube и VK Видео — зеркала, если YouTube не открывается.</p>{clip ? <div className="reel"><iframe src={clip} title="Запись" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen={true} /></div> : null}{videos === null ? <p className="meta">Записи открываются.</p> : null}{videos && shelf.length === 0 ? <p className="meta">На этой площадке записей мира на странице пока нет. Кнопка никуда не уводит.</p> : null}{shown.map(list => <div key={list.name} style={{
        marginTop: "1rem"
      }}><h3>{list.name.replace(/^YouTube · |^Rutube · |^RuTube · /, "")}</h3><div className="video-grid" style={{
          marginTop: "0.6rem"
        }}>{list.videos.map(video => <button key={video.href} className="video" type="button" data-on={clip === embedOf(video.href)} onClick={() => watch(video)}><Shot src={video.poster} alt="" /><b>{video.title}</b>{video.note ? <p>{video.note}</p> : null}</button>)}</div></div>)}{more ? <button className="ghost" type="button" style={{
        marginTop: "0.8rem"
      }} onClick={() => setOpen(value => !value)}>{open ? "Свернуть" : "Показать все записи мира"}</button> : null}</section></article>;
}
export function MusicView() {
  const play = usePlayer(s => s.play);
  const index = usePlayer(s => s.index);
  const queue = usePlayer(s => s.queue);
  const playing = usePlayer(s => s.playing);
  const current = index >= 0 ? queue[index] : void 0;
  return <section><p className="kicker">Плеер</p><h1 style={{
      fontSize: "clamp(3rem, 8vw, 5.4rem)"
    }}>Музыка</h1><p className="lead">Песни, которые выросли из ночей. Альбомы миров и её собственные. Плеер остаётся внизу, куда бы ты ни ушёл.</p><div className="albums"><article className="album-row" data-on={lucySongs.some(track => track.src === current?.src)}><Shot className={`album-face ${lucySongs.some(track => track.src === current?.src) && playing ? "is-on" : ""}`} src="/chronicle/music/sleeves/lucy.jpg" alt="Люси" /><div><div className="row"><h3>Люси</h3><span className="meta">её песни</span></div>{lucySongs.map((track, songIndex) => <button key={track.src} className="track" type="button" data-on={current?.src === track.src} onClick={() => play(track, lucySongs)}><span className="idx">{songIndex + 1}</span><span><b>{track.title}</b><em>{track.note}</em></span><span className="time">{track.length}</span></button>)}</div></article>{worlds.map(world => {
        const songs = catalog.filter(track => track.world === world.name);
        if (!songs.length) return null;
        const on = songs.some(track => track.src === current?.src);
        return <article key={world.name} className="album-row" data-on={on}><Shot className={`album-face ${on && playing ? "is-on" : ""}`} src={world.sleeve || world.cover} alt={world.name} /><div><div className="row"><h3>{world.name}</h3><span className="meta">{world.album}</span></div>{songs.map((track, songIndex) => <button key={track.src} className="track" type="button" data-on={current?.src === track.src} onClick={() => play(track, songs)}><span className="idx">{songIndex + 1}</span><span><b>{track.title}</b><em>{track.note}</em></span><span className="time">{track.length}</span></button>)}</div></article>;
      })}</div></section>;
}
export function BookView() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [placeId, setPlaceId] = useState(null);
  const play = usePlayer(s => s.play);
  const index = usePlayer(s => s.index);
  const queue = usePlayer(s => s.queue);
  const current = index >= 0 ? queue[index] : void 0;
  const tomeSong = catalog.find(track => track.src.endsWith("/schit.mp3"));
  useEffect(() => {
    setPlaceId(readPlace()?.id ?? null);
  }, []);
  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return volumes().map(volume => ({
      ...volume,
      chapters: volume.chapters.filter(chapter => {
        if (!needle) return true;
        return `${chapter.title} ${chapter.kicker} ${chapter.dek} ${chapter.numeral}`.toLowerCase().includes(needle);
      })
    })).filter(volume => volume.chapters.length);
  }, [query]);
  return <section className="toc"><p className="kicker">Полка</p><h1 style={{
      fontSize: "clamp(3rem, 8vw, 5.4rem)"
    }}>Книги</h1><p className="lead">Пока это первый том. Дальше их будет больше.</p><div className="shelf"><article className="tome"><img src="/brand/book.webp" alt="Обложка тома «Моя история»" /><div><p className="kicker">Том I</p><h2>Моя история</h2><p>От первого мира до сейчас. Это не просто книга. Это моя жизнь. Мои миры. Мои ошибки и победы.</p>{tomeSong ? <button className="track tome-song" data-led="tome-song" type="button" data-on={current?.src === tomeSong.src} onClick={() => play(tomeSong, [tomeSong])}><span className="idx">♪</span><span><b>{tomeSong.title}</b><em>Песня этого тома</em></span><span className="time">{tomeSong.length}</span></button> : null}<div className="actions"><button className="solid" type="button" onClick={() => go({
              name: "read",
              id: placeId || "prolog"
            })} onPointerEnter={() => void loadChapters()}>{placeId ? "Продолжить" : "Читать"}</button><button className="ghost" type="button" onClick={() => setOpen(value => !value)}>{open ? "Скрыть главы" : "Оглавление"}</button></div></div></article><article className="tome is-soon"><b>Том II</b><span>Ещё пишется</span></article></div>{open ? <><input className="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Найти главу" aria-label="Найти главу" />{groups.map(volume => <div key={volume.name}><h3>{volume.name}</h3><div className="grid-2">{volume.chapters.map(chapter => <button key={chapter.id} className="chapter-link" type="button" onClick={() => go({
            name: "read",
            id: chapter.id
          })}><span className="meta">{chapter.numeral} · {chapter.count} абзацев</span><b>{chapter.title === chapter.kicker ? chapter.title : `${chapter.kicker}. ${chapter.title}`}{placeId === chapter.id ? <Here /> : null}</b><span>{chapter.dek.slice(0, 180)}</span></button>)}</div></div>)}</> : null}</section>;
}
var PAPERS = [{
  id: "night",
  label: "Ночь"
}, {
  id: "sepia",
  label: "Сепия"
}, {
  id: "paper",
  label: "Бумага"
}, {
  id: "day",
  label: "День"
}];
export function ReadView({
  id
}) {
  const [pack, setPack] = useState(null);
  const [size, setSize] = useState("m");
  const [toc, setToc] = useState(false);
  const [paper, setPaper] = useState("night");
  const [placeId, setPlaceId] = useState(null);
  const [karaoke, setKaraoke] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("ghostpot-paper");
    if (saved === "night" || saved === "sepia" || saved === "paper" || saved === "day") setPaper(saved);
    setKaraoke(localStorage.getItem("ghostpot-karaoke") === "1");
  }, []);
  useEffect(() => {
    let live = true;
    loadChapters().then(chapters => {
      if (live) setPack(chapters);
    });
    return () => {
      live = false;
    };
  }, [id]);
  const chapters = pack ?? [];
  const index = Math.max(0, chapters.findIndex(chapter => chapter.id === id));
  const chapter = chapters[index];
  useEffect(() => {
    setPlaceId(readPlace()?.id ?? null);
  }, [id]);
  useEffect(() => {
    if (!chapter) return;
    setPlaceId(chapter.id);
    if (karaoke && useBookAudio.getState().playing) return;
    const place = readPlace();
    if (place?.id === chapter.id && place.y > 40) window.scrollTo({
      top: place.y
    });else savePlace(chapter.id, window.scrollY);
  }, [chapter, karaoke]);
  useEffect(() => {
    if (!chapter) return;
    const onScroll = () => savePlace(chapter.id, window.scrollY);
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    return () => {
      savePlace(chapter.id, window.scrollY);
      window.removeEventListener("scroll", onScroll);
    };
  }, [chapter]);
  if (!chapter) return <article className="reader"><p className="kicker">Книга</p><h1>Открываю главу</h1></article>;
  const prev = chapters[index - 1];
  const next = chapters[index + 1];
  return <div className="read-layout"><aside className={toc ? "reader-toc is-open" : "reader-toc"}><button className="ghost toc-toggle" type="button" onClick={() => setToc(value => !value)}>{toc ? "Скрыть главы" : "Главы"}</button><div className="toc-list">{volumes().map(volume => <div key={volume.name}><h3>{volume.name}</h3>{volume.chapters.map(item => <button key={item.id} className="chapter-link" type="button" data-on={item.id === chapter.id} onClick={() => go({
            name: "read",
            id: item.id
          })}><b>{item.title === item.kicker ? item.title : `${item.numeral}. ${item.title}`}{placeId === item.id ? <Here /> : null}</b></button>)}</div>)}</div></aside><article className="reader" data-paper={paper}><button className="quiet" type="button" onClick={() => go({
        name: "book"
      })}>← Оглавление</button><p className="kicker" style={{
        marginTop: "0.8rem"
      }}>{chapter.kicker} · {index + 1} / {chapters.length}</p><h1>{chapter.title}</h1><p className="dek">{chapter.dek}</p><div className="paper-row" data-led="papers" aria-label="Фон страницы">{PAPERS.map(item => <button key={item.id} className="paper" type="button" data-paper={item.id} data-on={paper === item.id} onClick={() => {
          setPaper(item.id);
          localStorage.setItem("ghostpot-paper", item.id);
        }}>{item.label}</button>)}</div><div className="actions" data-led="size" aria-label="Размер шрифта">{["s", "m", "l"].map(step => <button key={step} className="ghost" type="button" data-on={size === step} onClick={() => setSize(step)}>{step === "s" ? "А" : step === "m" ? "Аа" : "Ааа"}</button>)}<button className="ghost" type="button" data-on={karaoke} aria-pressed={karaoke} data-led="karaoke" title="Закрашивать буквы за голосом" onClick={() => {
          const next = !karaoke;
          setKaraoke(next);
          localStorage.setItem("ghostpot-karaoke", next ? "1" : "0");
        }}>Караоке</button></div><BookProse chapterId={chapter.id} chapters={chapters} paragraphs={chapter.paragraphs} plates={chapter.plates} size={size} karaoke={karaoke} onFollow={nextId => {
        if (nextId !== chapter.id) go({
          name: "read",
          id: nextId
        });
      }} /><nav className="pager" aria-label="Соседние главы"><button className="ghost" type="button" disabled={!prev} onClick={() => prev && go({
          name: "read",
          id: prev.id
        })}>Назад</button><button className="solid" type="button" onClick={() => next ? go({
          name: "read",
          id: next.id
        }) : go({
          name: "book"
        })}>{next ? "Дальше" : "К оглавлению"}</button></nav></article></div>;
}
export function GalleryView() {
  const [filter, setFilter] = useState("миры");
  const [open, setOpen] = useState(null);
  const [plates, setPlates] = useState([]);
  useEffect(() => {
    if (filter !== "книга" || plates.length) return;
    let live = true;
    loadChapters().then(chapters => {
      if (live) setPlates(platesOf(chapters));
    });
    return () => {
      live = false;
    };
  }, [filter, plates.length]);
  const items = filter === "миры" ? worlds.map(world => ({
    src: world.cover,
    alt: `${world.name}. ${world.album}`
  })) : filter === "шапка" ? hatShots : filter === "лица" ? [{
    src: "/brand/hero-photo.webp",
    alt: "Люси"
  }, {
    src: "/brand/book.webp",
    alt: "Люси. Обложка тома."
  }, {
    src: "/brand/hungry.webp",
    alt: "Люси с пустой миской."
  }, {
    src: "/brand/nikolay.webp",
    alt: "Николай, Ghostpot."
  }] : plates;
  return <section><p className="kicker">Галерея</p><h1 style={{
      fontSize: "clamp(3rem, 8vw, 5rem)"
    }}>Скриншоты, арты, обои</h1><div className="chips" data-led="filters" style={{
      margin: "1rem 0"
    }}>{["миры", "лица", "шапка", "книга"].map(name => <button key={name} className="ghost" type="button" data-on={filter === name} onClick={() => setFilter(name)}>{name === "книга" ? plates.length ? `Из книги · ${plates.length}` : "Из книги" : name}</button>)}</div><div className="shot-grid">{items.map(item => <button key={item.src + item.alt} className="shot" type="button" onClick={() => setOpen(item)}><Shot src={item.src} alt={item.alt} /><figcaption>{item.alt}</figcaption></button>)}</div>{open ? <div className="lightbox" role="dialog" aria-label={open.alt} onClick={() => setOpen(null)}><div><Shot src={open.src} alt={open.alt} /><p>{open.alt}</p></div></div> : null}</section>;
}
export function ShopView() {
  const [shot, setShot] = useState(0);
  const photo = hatShots[shot] ?? hatShots[0];
  return <section><p className="kicker">Шапка</p><div className="grid-2"><div><button className="shot" type="button" onClick={() => setShot((shot + 1) % hatShots.length)} aria-label="Следующее фото шапки" data-led="hat"><Shot src={photo.src} alt={photo.alt} /></button><div className="chips" style={{
          marginTop: "0.6rem"
        }}>{hatShots.map((item, index) => <button key={item.src} className="ghost" type="button" data-on={index === shot} onClick={() => setShot(index)}>{index + 1}</button>)}</div></div><div className="hat"><h1>Банная шапка из альпаки, мериноса, конопли и хлопка</h1><p className="script">2 500 ₽</p><p className="meta">«Двойная природа» · вяжу на заказ · новое · универсальный размер</p><div className="fibers">{["Альпака 50%", "Меринос 50%", "Хлопок 70%", "Конопля 30%"].map(fiber => <span key={fiber}>{fiber}</span>)}</div><p>Снаружи альпака и меринос, внутри хлопок и конопля. Голова дышит, влага уходит, в парной можно стоять дольше. В подарок льняной или хлопковый мешочек.</p><div className="hat-order"><h2>Заказать</h2><p>Напиши в группу. Telegram, MAX или спроси на стриме. Назови цвет и обхват головы, если нужен свой размер.</p><div className="actions"><a className="solid" href={links.telegram}>Telegram</a><a className="ghost" href={links.max}>MAX</a><a className="ghost" href={links.twitch}>На стриме</a></div></div></div></div><section className="section hat-story"><h2>Банная шапка «Двойная природа»: как устроена</h2><p>Вяжу её сам, вручную, в Новосибирске. Это не войлочный колпак, а сэндвич из четырёх натуральных волокон. Внешние слои: 50% альпака и 50% меринос. Они мягко касаются кожи, сразу уводят влагу и не сушат волосы. Внутренняя прослойка: 70% хлопок и 30% конопля. Конопля работает как натуральный антисептик, хлопок забирает пот без эффекта парника. Вес около 150 граммов, после долгого парения шапка не давит.</p><p>В парной голова дышит, влага уходит, перегрева нет. За счёт этого в жаре обычно стоят на 20–30% дольше и не ловят мокрую макушку. Размер универсальный, можно связать под обхват головы. Цвета: чёрный, белый, серый, коричневый, бежевый, зелёный, золотистый. Другой оттенок спрашивайте. К заказу идёт мешочек для хранения и упаковка для пересылки.</p><h2>Чем она лучше обычной банной шапки</h2><ul><li>Не акрил: не парит, не колется, не скатывается и не впитывает запах парной.</li><li>Не джут: не натирает кожу, не плесневеет и не теряет форму.</li><li>Не мех и не кожа: голова не преет, шапка не тяжелеет от влаги и быстро сохнет.</li><li>Гипоаллергенная. Подходит, если обычная шерсть зудит или есть реакция на синтетику.</li></ul><h2>Кому подойдёт и как заказать</h2><p>Для тех, кто хочет дольше оставаться в русской бане, хаммаме и на коротком заходе в сауну. Для парильщиков, кому важен аксессуар на каждый день. Для подарка, который не выглядит как колпак из магазина у дома.</p><p>Самовывоз у меня: Новосибирский район, посёлок Элитный, микрорайон Фламинго. Доставка через Озон в пункт выдачи. На сайте оплату не беру. Напишите мне в Telegram или MAX, какой цвет нужен, или спросите на моём стриме. Стирка ручная, в прохладной воде. При таком уходе шапка служит годами.</p></section></section>;
}
export function LucyView() {
  const play = usePlayer(s => s.play);
  const index = usePlayer(s => s.index);
  const queue = usePlayer(s => s.queue);
  const playing = usePlayer(s => s.playing);
  const current = index >= 0 ? queue[index] : void 0;
  const on = lucySongs.some(track => track.src === current?.src);
  return <section><p className="kicker">В главной роли</p><div className="grid-2"><figure className="portrait sheet"><Shot src="/chronicle/party/lucy-ref.jpg?v=2" alt="Люси. Crafted by ghostpot." /></figure><div><h1 style={{
          fontSize: "clamp(3.4rem, 8vw, 6rem)"
        }}>Люси</h1><p className="lead">Один человек на много игр. Мир меняет правила, одежду и то, чем её можно убить. Паспорт остаётся. Для местных она не гостья: будто всегда здесь жила.</p><p className="quote">«Я не знаю, куда откроется следующий мир. Но уши и сарказм всегда со мной.»</p></div></div><dl className="passport">{passport.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl><div className="grid-3"><article className="panel"><h2>Кто она</h2><p>Люси — двадцать пять. Человек с рысьими ушами, шрамом на скуле и мозолью от рукояти. Не «милая девочка с ушками». Она уже умирала в других мирах, поэтому в новом не несётся сломя голову. Сначала смотрит, потом говорит. Если очень страшно — шутит суше.</p></article><article className="panel"><h2>Как живёт в игре</h2><p>Начинает с нуля: ни меча, ни сумки, часто босая. Система, или кто там открывает двери, любит это. Дальше она играет по правилам мира. В колонии носит воду. В степи держит щит. В пустоши считает патроны. В Азероте шьёт и хилит, потому что танка всё равно нет.</p></article><article className="panel"><h2>Зачем она на эфире</h2><p>Эфир и есть её жизнь в этом заезде. Сказанное слово может стать строчкой книги или припевом. Николай за клавиатурой не переписывает вечер задним числом. Если Люси умерла, значит умерла. Паспорт от этого не рвётся. Открывается следующий мир.</p></article></div><section className="section"><header><h2>Альбом Люси</h2><span className="meta">её песни</span></header><article className="album-row" data-on={on}><Shot className={`album-face ${on && playing ? "is-on" : ""}`} src="/chronicle/music/sleeves/lucy.jpg" alt="Люси" /><div>{lucySongs.map((track, songIndex) => <button key={track.src} className="track" type="button" data-on={current?.src === track.src} onClick={() => play(track, lucySongs)}><span className="idx">{songIndex + 1}</span><span><b>{track.title}</b><em>{track.note}</em></span><span className="time">{track.length}</span></button>)}</div></article></section></section>;
}
export function AboutView() {
  return <section><p className="kicker">За клавиатурой</p><div className="grid-2"><div className="portrait person"><Shot src="/brand/nikolay.webp" alt="Николай, Ghostpot." /></div><div><h1 style={{
          fontSize: "clamp(3rem, 8vw, 5.5rem)"
        }}>Николай</h1><p className="script">40 уровень. Класс: ночной эфир.</p><p className="lead">Люси на экране, он за клавиатурой. Николай Чичкань. Стример, автор книги и песен, которые остаются после ночи.</p><div className="actions"><a className="solid" href={links.mail}>Написать</a><a className="ghost" href={links.telegram}>Telegram</a></div></div></div><div className="grid-3" style={{
      marginTop: "1rem"
    }}>{skills.map(skill => <article key={skill.name} className="skill"><h3>{skill.name}</h3><p>{skill.note}</p></article>)}</div><section className="section panel"><h2>Каналы</h2><div className="grid-2" style={{
        marginTop: "0.7rem"
      }}>{channels.map(channel => <a key={channel.href} className="night" href={channel.href}><b>{channel.name}</b><span>{channel.note}</span></a>)}</div></section></section>;
}
export function StreamsView() {
  const [query, setQuery] = useState("");
  const [host, setHost] = useState("youtube");
  const [clip, setClip] = useState(null);
  const videos = useVideos();
  const needle = query.trim().toLowerCase();
  return <section><p className="kicker">Эфиры</p><h1 style={{
      fontSize: "clamp(3rem, 8vw, 5rem)"
    }}>Ночи и записи</h1><p className="lead">Стримы — она живёт здесь и сейчас. Шорты: миссия, урок, критический момент. Длинные записи: дневник текущей жизни.</p><AirFeed /><div className="actions" data-led="host"><a className="solid" href={links.twitch}>Twitch</a><button className="ghost" type="button" data-on={host === "youtube"} onClick={() => {
        setHost("youtube");
        setClip(null);
      }}>YouTube</button><button className="ghost" type="button" data-on={host === "rutube"} onClick={() => {
        setHost("rutube");
        setClip(null);
      }}>RuTube</button><button className="ghost" type="button" data-on={host === "vk"} onClick={() => {
        setHost("vk");
        setClip(null);
      }}>VK Видео</button></div><input className="search" style={{
      marginTop: "1.2rem"
    }} value={query} placeholder="Найти запись" data-led="search" aria-label="Найти запись" onChange={event => setQuery(event.target.value)} />{clip ? <div className="reel"><iframe src={clip} title="Запись" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen={true} /></div> : null}{videos === null ? <p className="meta" style={{
      marginTop: "1rem"
    }}>Записи открываются.</p> : null}{worlds.map(world => {
      const lists = listsOn(videos?.[world.name] ?? [], host).map(list => ({
        ...list,
        videos: list.videos.filter(video => !needle || `${video.title} ${video.note} ${world.name}`.toLowerCase().includes(needle))
      })).filter(list => list.videos.length);
      if (!lists.length) return null;
      return <div key={world.name} className="section"><h2>{world.name}</h2>{lists.map(list => <div key={list.name}><div className="video-grid" style={{
            marginTop: "0.55rem"
          }}>{list.videos.map(video => <button key={video.href} className="video" type="button" data-on={clip === embedOf(video.href)} onClick={() => setClip(embedOf(video.href))}><Shot src={video.poster} alt="" /><b>{video.title}</b></button>)}</div></div>)}</div>;
    })}</section>;
}
export function ProgramsView() {
  return <section><p className="kicker">Программы</p><h1 style={{
      fontSize: "clamp(3rem, 8vw, 5.5rem)"
    }}>Речь</h1><p className="script">Чат в эфир. Игра — вслух.</p><p className="lead">Программа для Windows. Собирает чат площадок в одну ленту, показывает его в OBS и читает разными голосами, по-русски и по-английски. В игре обводит кусок экрана и переводит. Сама не говорит: чтобы прозвучало, нужна клавиша. Если в чате написали «Люси», она коротко отвечает про книгу, эфир и песни.</p><div className="actions"><a className="solid" data-led="speech" href="https://github.com/Ghostpot/LucyChat/releases/download/v1.6.9/RECH-Windows.zip">Скачать Речь</a><span className="meta">Windows 10 или 11, 64-bit · без установки · около 70 МБ · <a href="https://github.com/Ghostpot/LucyChat">исходники</a> · <a href="https://github.com/Ghostpot/LucyChat/blob/main/docs/KAK.md">как подключить</a></span></div><div className="video-grid" style={{
      marginTop: "1.2rem"
    }}><figure className="video program-shot"><img src="/programs/efir.webp" alt="Лента чата и голос в окне Речи" width="1280" height="800" /><b>Эфир</b><p>Несколько площадок в одной ленте. Окно можно отдать в OBS.</p></figure><figure className="video program-shot"><img src="/programs/igra.webp" alt="Список обведённого текста из игры" width="1280" height="800" /><b>Игра</b><p>Обведённый кусок экрана. Английский переводится и читается.</p></figure><figure className="video program-shot"><img src="/programs/ramka.webp" alt="Рамка перевода поверх игры" width="1280" height="800" /><b>Рамка</b><p>Перевод в окне. Или вставить свой текст и озвучить его.</p></figure></div><div className="grid-3" style={{
      marginTop: "1rem"
    }}><article className="skill"><h3>Экран</h3><p>Ctrl+Ё или «Обвести сейчас». Рамка тащится за верхнюю строку. «Говорить» — по клавише, не сама. Можно оставить только перевод, без голоса.</p></article><article className="skill"><h3>Чат</h3><p>Twitch, YouTube, VK Видео, GoodGame, Rutube, Steam. Новые сообщения читает в очередь, не перебивая себя. Наградой за баллы можно заказать песню или спросить Люси. Галка «Не читать ругань» оставляет мат на экране, но не произносит его. Пауза голоса — F8.</p></article><article className="skill"><h3>Голоса</h3><p>Ксения, Ксюша, Бая, Айдар, Евгений. Свой язык — своим голосом. Один раз «Скачать голос», дальше интернет для фразы не нужен. Чужой текст вставляется в рамку.</p></article></div><section className="section panel"><h2>Как запустить</h2><div className="hat-story"><ul><li>Распакуй архив в обычную папку. Из самого архива программа не стартует.</li><li>Запусти RECH.exe. Если Windows пишет «система защитила компьютер» — «Подробнее», затем «Выполнить в любом случае».</li><li>Слева площадка и канал, кнопка «Подключить». Справа включи «Озвучивать новые сообщения» и проверь голос.</li><li>Ссылку из блока OBS вставь в источник «Браузер». Это отдельный чат для эфира, не то окно, которое на столе.</li></ul></div></section></section>;
}
export function LawView() {
  return <section className="reader"><p className="kicker">Правила дома</p><h1>Политика, соглашение, cookie</h1><div className="prose"><p>Сайт про ночные игровые эфиры, книгу и песни. Контент 18+. Это не магазин с оплатой на странице: шапку и поддержку оформляют напрямую, в Telegram, MAX, Boosty или DonationAlerts.</p><p>Персональные данные россиян на сайт не собираются. Форм с паспортом, телефоном и адресом нет. Письмо уходит на nikolay@whitebunny.ru только если написать самому.</p><p>На устройстве запоминаются только выбор cookie, место в книге и громкость плеера. На сервер это не уходит.</p><p>Чужие площадки — Twitch, YouTube, Rutube, VK, GoodGame, W.TV, Yappy, Boosty, DonationAlerts, MAX — живут по своим правилам. Ссылки ведут туда как есть.</p><p>Тексты, песни и образ Люси принадлежат Николаю Чичкань. Игровые миры принадлежат своим правообладателям. Картинки миров — иллюстрации к хронике, не официальные обложки студий.</p></div></section>;
}
var LINES = ["Спрашивай. Только коротко. Я занята тем, что пытаюсь не умереть.", "Новые миры. Те же вопросы. Кто я?", "То же лицо. Те же уши. Новое тело.", "Я не знаю, куда откроется следующий мир. Но уши и сарказм всегда со мной.", "Если мир молчит, песня поёт. Не орёшь на пустую миску.", "Осколки. По одному из мира. Этот сайт — комната, где я их держу."];
export function Whisper() {
  const [open, setOpen] = useState(false);
  const [line, setLine] = useState(LINES[0]);
  return <div className="whisper">{open ? <div className="whisper-card" role="dialog" aria-label="Люси"><p className="kicker">Люси, не поднимая глаз</p><p>{line}</p><div className="whisper-asks"><button type="button" onClick={() => setLine(LINES[1])}>Ты здесь?</button><button type="button" onClick={() => setLine(LINES[3])}>Кто ты?</button><button type="button" onClick={() => setLine(LINES[5])}>Что в руках?</button><button type="button" onClick={() => setOpen(false)}>Поняла, спрячься</button></div></div> : null}<button className="whisper-face" type="button" aria-label="Помощник Люси" data-led="whisper" onClick={() => setOpen(value => !value)}><Shot src="/brand/hungry.webp" alt="" /></button></div>;
}
export function CookieNote() {
  const [ok, setOk] = useState(true);
  useEffect(() => {
    setOk(localStorage.getItem("ghostpot-cookies") === "1");
  }, []);
  if (ok) return null;
  return <div className="cookie"><p style={{
      margin: 0
    }}>На устройстве запоминаются только выбор cookie, место в книге и громкость. На сервер это не уходит.</p><button className="solid" type="button" onClick={() => {
      localStorage.setItem("ghostpot-cookies", "1");
      setOk(true);
    }}>Понятно</button></div>;
}