import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { BookOpen, ChevronDown, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { catalog, lucySongs, media, worlds } from "@/data/content";
import { narration } from "@/data/narration";
import { useBookAudio } from "@/lib/book-audio";
import { keepAudio } from "@/lib/keep-audio";
import { usePlayer } from "@/lib/player-store";

function clock(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const total = Math.floor(value);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const tomes = [{ id: "tom-1", title: "Том I. Моя история", tracks: narration }];

export function PlayerBar() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const seekLock = useRef(false);
  const queue = usePlayer((s) => s.queue);
  const index = usePlayer((s) => s.index);
  const playing = usePlayer((s) => s.playing);
  const restart = usePlayer((s) => s.restart);
  const currentTime = usePlayer((s) => s.currentTime);
  const duration = usePlayer((s) => s.duration);
  const volume = usePlayer((s) => s.volume);
  const collapsed = usePlayer((s) => s.collapsed);
  const setCollapsed = usePlayer((s) => s.setCollapsed);
  const toggle = usePlayer((s) => s.toggle);
  const next = usePlayer((s) => s.next);
  const prev = usePlayer((s) => s.prev);
  const seek = usePlayer((s) => s.seek);
  const setTime = usePlayer((s) => s.setTime);
  const setVolume = usePlayer((s) => s.setVolume);
  const play = usePlayer((s) => s.play);
  const pause = usePlayer((s) => s.pause);
  const bookIndex = useBookAudio((s) => s.index);
  const bookPlaying = useBookAudio((s) => s.playing);
  const bookTime = useBookAudio((s) => s.currentTime);
  const bookDuration = useBookAudio((s) => s.duration);
  const bookVolume = useBookAudio((s) => s.volume);
  const bookQueue = useBookAudio((s) => s.queue);
  const [mode, setMode] = useState<"music" | "book">("music");
  const [listOpen, setListOpen] = useState(false);
  const albums = useMemo(
    () =>
      [
        { name: "её песни", album: "Люси", tracks: lucySongs },
        ...worlds.map((world) => ({
          name: world.name,
          album: world.album,
          tracks: catalog.filter((track) => track.world === world.name),
        })),
      ].filter((album) => album.tracks.length),
    [],
  );
  const track = index >= 0 ? queue[index] : undefined;
  const chapter = bookIndex >= 0 ? bookQueue[bookIndex] : undefined;
  const book = mode === "book";
  const bookMode = useRef(book);
  bookMode.current = book;

  useLayoutEffect(() => {
    const audio = keepAudio("music");
    audioRef.current = audio;
    if (!audio) return;
    const onTime = () => {
      if (seekLock.current || bookMode.current) return;
      setTime(audio.currentTime, audio.duration || 0);
    };
    const onMeta = () => {
      if (bookMode.current) return;
      setTime(audio.currentTime, audio.duration || 0);
    };
    const onEnded = () => {
      if (!bookMode.current) next();
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
    };
  }, [next, setTime]);

  useEffect(() => {
    const saved = localStorage.getItem("ghostpot-listen");
    if (saved === "book" || saved === "music") setMode(saved);
    if (localStorage.getItem("ghostpot-player-hidden") === "1") setCollapsed(true);
    const raw = localStorage.getItem("ghostpot-volume");
    if (raw === null) return;
    const savedVolume = Number(raw);
    if (Number.isFinite(savedVolume)) setVolume(savedVolume);
  }, [setCollapsed, setVolume]);

  useEffect(() => {
    const onBook = () => pause();
    window.addEventListener("ghostpot-book", onBook);
    return () => window.removeEventListener("ghostpot-book", onBook);
  }, [pause]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (audio.dataset.src !== track.src) {
      audio.dataset.src = track.src;
      audio.src = media(track.src);
    }
    if (playing) void audio.play().catch(() => pause());
    else audio.pause();
  }, [track, playing, pause]);

  const skipRestart = useRef(true);
  useEffect(() => {
    if (skipRestart.current) {
      skipRestart.current = false;
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
  }, [restart]);

  const choose = (nextMode: "music" | "book") => {
    setMode(nextMode);
    setListOpen(false);
    localStorage.setItem("ghostpot-listen", nextMode);
    if (nextMode === "book") pause();
    else useBookAudio.getState().pause();
  };

  const onPick = (value: string) => {
    setListOpen(false);
    if (!value) return;
    if (book) {
      const part = narration.find((item) => item.id === value);
      if (part) useBookAudio.getState().play(part);
      return;
    }
    const [albumIndex, trackIndex] = value.split(":").map(Number);
    const album = albums[albumIndex];
    const song = album?.tracks[trackIndex];
    if (album && song) play(song, album.tracks);
  };

  const onToggle = () => {
    if (book) {
      const state = useBookAudio.getState();
      if (state.index < 0) state.play(tomes[0].tracks[0]);
      else state.toggle();
      return;
    }
    if (index < 0 && albums[0]) play(albums[0].tracks[0], albums[0].tracks);
    else toggle();
  };

  const onPrev = () => (book ? useBookAudio.getState().prev() : prev());
  const onNext = () => (book ? useBookAudio.getState().next() : next());
  const shownTime = book ? bookTime : currentTime;
  const shownDuration = book ? bookDuration : duration;
  const shownVolume = book ? bookVolume : volume;
  const setShownVolume = (value: number) => (book ? useBookAudio.getState().setVolume(value) : setVolume(value));
  const title = book ? (chapter ? `${chapter.chapter}. ${chapter.title}` : "Том I. Моя история") : (track?.title ?? "Песни миров");
  const who = book
    ? chapter
      ? "Озвучка тома"
      : "Выбери том и главу"
    : track
      ? `${track.world} · ${track.note || track.length}`
      : "Выбери альбом";

  return (
    <aside className={`${collapsed ? "player is-away" : "player"}${book ? " is-book" : ""}`} aria-label="Плеер">
      {collapsed ? (
        <button className="player-tab" type="button" onClick={() => setCollapsed(false)}>
          {book ? <BookOpen size={16} /> : <Play size={16} />}
          <span>{bookPlaying || playing ? title : book ? "Книга" : "Музыка"}</span>
        </button>
      ) : (
        <>
          <div className="player-main">
            <div className={`disc ${book ? "is-tome" : ""} ${(book ? bookPlaying : playing) ? "is-on" : ""}`}>
              {book ? <BookOpen size={22} /> : track ? <img src={media(track.cover)} alt="" /> : <div className="ph">♪</div>}
            </div>
            <div className="player-copy">
              <div className="modes">
                <button type="button" data-on={!book} onClick={() => choose("music")}>
                  Музыка
                </button>
                <button type="button" data-led="mode-book" data-on={book} onClick={() => choose("book")}>
                  Книга
                </button>
                <button className="pick" data-led="pick" type="button" aria-expanded={listOpen} onClick={() => setListOpen((open) => !open)}>
                  {book ? (chapter ? `${chapter.chapter}. ${chapter.title}` : "Том и глава") : track ? `${track.world} · ${track.title}` : "Альбом и песня"}
                </button>
              </div>
              {listOpen ? (
                <div className="playlist" role="listbox">
                  {book
                    ? tomes.map((tome) => (
                        <div key={tome.id}>
                          <h4>{tome.title}</h4>
                          {tome.tracks.map((part) => (
                            <button key={part.id} type="button" data-on={part.id === chapter?.id} onClick={() => onPick(part.id)}>
                              {part.chapter}. {part.title}
                            </button>
                          ))}
                        </div>
                      ))
                    : albums.map((album, albumIndex) => (
                        <div key={album.name}>
                          <h4>
                            {album.album} · {album.name}
                          </h4>
                          {album.tracks.map((song, trackIndex) => (
                            <button
                              key={song.src}
                              type="button"
                              data-on={track?.src === song.src}
                              onClick={() => onPick(`${albumIndex}:${trackIndex}`)}
                            >
                              {song.title}
                            </button>
                          ))}
                        </div>
                      ))}
                </div>
              ) : null}
              <b>{title}</b>
              <div className="who">{who}</div>
            </div>
            <div className="controls">
              <button className="iconbtn" type="button" aria-label="Назад" onClick={onPrev}>
                <SkipBack size={18} />
              </button>
              <button className="iconbtn play" type="button" aria-label={(book ? bookPlaying : playing) ? "Пауза" : "Играть"} onClick={onToggle}>
                {(book ? bookPlaying : playing) ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button className="iconbtn" type="button" aria-label="Дальше" onClick={onNext}>
                <SkipForward size={18} />
              </button>
              <button className="iconbtn" type="button" data-led="collapse" aria-label="Спрятать плеер" onClick={() => setCollapsed(true)}>
                <ChevronDown size={18} />
              </button>
            </div>
          </div>
          <div className="player-bars">
          <div className="seek">
            <span>{clock(shownTime)}</span>
            <input
              suppressHydrationWarning
              aria-label={book ? "Место в главе" : "Место в песне"}
              type="range"
              min={0}
              max={1000}
              value={shownDuration ? Math.round((shownTime / shownDuration) * 1000) : 0}
              onPointerDown={() => {
                seekLock.current = true;
              }}
              onPointerUp={() => {
                seekLock.current = false;
              }}
              onChange={(event) => {
                const ratio = Number(event.target.value) / 1000;
                if (book) {
                  useBookAudio.getState().seek(ratio);
                  return;
                }
                const audio = audioRef.current;
                seek(ratio);
                if (audio && audio.duration) audio.currentTime = ratio * audio.duration;
              }}
            />
            <span>{book ? clock(shownDuration) : (track?.length ?? clock(shownDuration))}</span>
          </div>
          <label className="vol seek">
            <span>Громкость</span>
            <input
              suppressHydrationWarning
              aria-label="Громкость"
              type="range"
              min={0}
              max={100}
              value={Math.round(shownVolume * 100)}
              onChange={(event) => setShownVolume(Number(event.target.value) / 100)}
            />
            <span>{Math.round(shownVolume * 100)}</span>
          </label>
          </div>
        </>
      )}
    </aside>
  );
}