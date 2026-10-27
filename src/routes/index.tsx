import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AboutView,
  BookView,
  CookieNote,
  GalleryView,
  HomeView,
  LawView,
  LucyView,
  MusicView,
  ProgramsView,
  ReadView,
  Shell,
  ShopView,
  StreamsView,
  Whisper,
  WorldView,
  WorldsView,
  parseHash,
  type View,
} from "@/components/chronicle";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [view, setView] = useState<View>({ name: "home" });

  useEffect(() => {
    const sync = () => setView(parseHash());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return (
    <Shell view={view}>
      {view.name === "home" ? <HomeView /> : null}
      {view.name === "worlds" ? <WorldsView /> : null}
      {view.name === "world" ? <WorldView id={view.id} /> : null}
      {view.name === "book" ? <BookView /> : null}
      {view.name === "read" ? <ReadView id={view.id} /> : null}
      {view.name === "music" ? <MusicView /> : null}
      {view.name === "gallery" ? <GalleryView /> : null}
      {view.name === "shop" ? <ShopView /> : null}
      {view.name === "about" ? <AboutView /> : null}
      {view.name === "lucy" ? <LucyView /> : null}
      {view.name === "streams" ? <StreamsView /> : null}
      {view.name === "programs" ? <ProgramsView /> : null}
      {view.name === "law" ? <LawView /> : null}
      <Whisper />
      <CookieNote />
    </Shell>
  );
}
