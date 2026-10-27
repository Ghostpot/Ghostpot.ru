import { create } from "zustand";
import { catalog, type Playable } from "@/data/content";

type PlayerState = {
  queue: Playable[];
  index: number;
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queueOpen: boolean;
  restart: number;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  play: (track: Playable, queue?: Playable[]) => void;
  toggle: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  seek: (ratio: number) => void;
  setTime: (current: number, duration: number) => void;
  setVolume: (volume: number) => void;
  setQueueOpen: (open: boolean) => void;
  jump: (index: number) => void;
};

function musicOn() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("ghostpot-music"));
}

export const usePlayer = create<PlayerState>((set, get) => ({
  queue: catalog,
  index: -1,
  playing: false,
  currentTime: 0,
  duration: 0,
  volume: 0.9,
  queueOpen: false,
  restart: 0,
  collapsed: false,
  setCollapsed: (collapsed) => {
    localStorage.setItem("ghostpot-player-hidden", collapsed ? "1" : "0");
    set({ collapsed, queueOpen: collapsed ? false : get().queueOpen });
  },
  play: (track, queue) => {
    const list = queue ?? get().queue;
    const index = list.findIndex((item) => item.src === track.src && item.world === track.world);
    musicOn();
    set({ queue: list, index: index < 0 ? 0 : index, playing: true, currentTime: 0, collapsed: false });
  },
  toggle: () => {
    const { index, queue, playing } = get();
    if (index < 0 && queue[0]) {
      musicOn();
      set({ index: 0, playing: true });
      return;
    }
    if (!playing) musicOn();
    set({ playing: !playing });
  },
  pause: () => set({ playing: false }),
  next: () => {
    const { index, queue } = get();
    if (!queue.length) return;
    const next = index < 0 ? 0 : (index + 1) % queue.length;
    musicOn();
    set({ index: next, playing: true, currentTime: 0 });
  },
  prev: () => {
    const { index, queue, currentTime, restart } = get();
    if (!queue.length) return;
    if (currentTime > 3) {
      musicOn();
      set({ currentTime: 0, playing: true, restart: restart + 1 });
      return;
    }
    const prev = index <= 0 ? queue.length - 1 : index - 1;
    musicOn();
    set({ index: prev, playing: true, currentTime: 0 });
  },
  seek: (ratio) => {
    const duration = get().duration || 0;
    set({ currentTime: Math.max(0, Math.min(1, ratio)) * duration });
  },
  setTime: (currentTime, duration) => set({ currentTime, duration }),
  setVolume: (volume) => {
    localStorage.setItem("ghostpot-volume", String(volume));
    set({ volume });
  },
  setQueueOpen: (queueOpen) => set({ queueOpen }),
  jump: (index) => {
    musicOn();
    set({ index, playing: true, currentTime: 0 });
  },
}));

export function currentTrack() {
  const { queue, index } = usePlayer.getState();
  return index >= 0 ? queue[index] : undefined;
}
