import { create } from "zustand";
import { narration, type Narration } from "@/data/narration";

type BookAudioState = {
  queue: Narration[];
  index: number;
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  collapsed: boolean;
  restart: number;
  play: (track: Narration) => void;
  toggle: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  seek: (ratio: number) => void;
  setTime: (current: number, duration: number) => void;
  setVolume: (volume: number) => void;
  setCollapsed: (collapsed: boolean) => void;
};

function bookOn() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("ghostpot-book"));
}

export const useBookAudio = create<BookAudioState>((set, get) => ({
  queue: narration,
  index: -1,
  playing: false,
  currentTime: 0,
  duration: 0,
  volume: 0.9,
  collapsed: false,
  restart: 0,
  play: (track) => {
    const index = narration.findIndex((item) => item.id === track.id);
    bookOn();
    set({ queue: narration, index: index < 0 ? 0 : index, playing: true, currentTime: 0, collapsed: false });
  },
  toggle: () => {
    const { index, playing } = get();
    if (index < 0) return;
    if (!playing) bookOn();
    set({ playing: !playing });
  },
  pause: () => set({ playing: false }),
  next: () => {
    const { index, queue } = get();
    if (!queue.length || index < 0) return;
    if (index >= queue.length - 1) {
      set({ playing: false });
      return;
    }
    bookOn();
    set({ index: index + 1, playing: true, currentTime: 0 });
  },
  prev: () => {
    const { index, queue, currentTime, restart } = get();
    if (index < 0 || !queue.length) return;
    if (currentTime > 3) {
      set({ currentTime: 0, playing: true, restart: restart + 1 });
      return;
    }
    bookOn();
    set({ index: Math.max(0, index - 1), playing: true, currentTime: 0 });
  },
  seek: (ratio) => {
    const duration = get().duration || 0;
    set({ currentTime: Math.max(0, Math.min(1, ratio)) * duration });
  },
  setTime: (currentTime, duration) => set({ currentTime, duration }),
  setVolume: (volume) => {
    localStorage.setItem("ghostpot-book-volume", String(volume));
    set({ volume });
  },
  setCollapsed: (collapsed) => set({ collapsed }),
}));
