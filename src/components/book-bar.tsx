import { useEffect, useLayoutEffect, useRef } from "react";
import { media } from "@/data/content";
import { useBookAudio } from "@/lib/book-audio";
import { rememberDuration } from "@/lib/karaoke";
import { keepAudio } from "@/lib/keep-audio";

export function BookBar() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const seekLock = useRef(false);
  const queue = useBookAudio((s) => s.queue);
  const index = useBookAudio((s) => s.index);
  const playing = useBookAudio((s) => s.playing);
  const volume = useBookAudio((s) => s.volume);
  const currentTime = useBookAudio((s) => s.currentTime);
  const setTime = useBookAudio((s) => s.setTime);
  const setVolume = useBookAudio((s) => s.setVolume);
  const pause = useBookAudio((s) => s.pause);
  const next = useBookAudio((s) => s.next);
  const track = index >= 0 ? queue[index] : undefined;

  useLayoutEffect(() => {
    const audio = keepAudio("book");
    audioRef.current = audio;
    if (!audio) return;
    const onTime = () => {
      if (seekLock.current) return;
      setTime(audio.currentTime, audio.duration || 0);
    };
    const onMeta = () => {
      setTime(audio.currentTime, audio.duration || 0);
      const current = useBookAudio.getState();
      const item = current.index >= 0 ? current.queue[current.index] : undefined;
      if (item && Number.isFinite(audio.duration)) rememberDuration(item.id, audio.duration);
    };
    const onEnded = () => next();
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
    const raw = localStorage.getItem("ghostpot-book-volume");
    if (raw === null) return;
    const saved = Number(raw);
    if (Number.isFinite(saved)) setVolume(saved);
  }, [setVolume]);

  useEffect(() => {
    const onMusic = () => pause();
    window.addEventListener("ghostpot-music", onMusic);
    return () => window.removeEventListener("ghostpot-music", onMusic);
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
      const resume = useBookAudio.getState().currentTime;
      audio.dataset.src = track.src;
      audio.src = media(track.src);
      if (resume > 1) {
        const seekResume = () => {
          if (audio.duration) audio.currentTime = Math.min(resume, Math.max(0, audio.duration - 0.4));
          audio.removeEventListener("loadedmetadata", seekResume);
        };
        audio.addEventListener("loadedmetadata", seekResume);
      }
    }
    if (playing) void audio.play().catch(() => pause());
    else audio.pause();
  }, [track, playing, pause]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (Math.abs(audio.currentTime - currentTime) > 0.75) audio.currentTime = currentTime;
  }, [currentTime, track]);

  return null;
}
