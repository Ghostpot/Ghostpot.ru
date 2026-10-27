import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/chronicle";
import { GuideIndex } from "@/components/guides-view";

export const Route = createFileRoute("/guides/")({
  head: () => ({
    meta: [
      { title: "Гайды по играм Люси — Ghostpot" },
      {
        name: "description",
        content:
          "Прохождения и лайфхаки Ghostpot: Gothic Remake, Kenshi, Fallout, WoW хардкор, Bannerlord, Zomboid и другие миры Люси. Уроки со шортов и эфиров.",
      },
    ],
    links: [{ rel: "canonical", href: "https://ghostpot.ru/guides" }],
  }),
  component: function GuidesPage() {
    return (
      <Shell view={{ name: "law" }} guides>
        <GuideIndex />
      </Shell>
    );
  },
});