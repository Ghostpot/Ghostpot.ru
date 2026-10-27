export type Narration = {
  id: string;
  chapter: string;
  title: string;
  src: string;
};

const prologue: Narration[] = [
  { id: "pro-1", chapter: "Пролог", title: "Пролог", src: "/chronicle/audio/prologue_revoice.mp3" },
];

const chapterOne: Narration[] = Array.from({ length: 17 }, (_, index) => ({
  id: `c1-${index + 1}`,
  chapter: "Глава 1",
  title: `Часть ${index + 1}`,
  src: `/chronicle/audio/chapter1_part${index + 1}.mp3`,
}));

const chapterTwo: Narration[] = Array.from({ length: 123 }, (_, index) => {
  const n = index + 1;
  const v = n >= 22 && n <= 41 ? "?v=2" : "";
  return {
    id: `c2-${n}`,
    chapter: "Глава 2",
    title: `Часть ${n}`,
    src: `/chronicle/audio/chapter2_part${n}.mp3${v}`,
  };
});

// Аудио режется на куски короче текстовых частей. Номер в плеере — номер части в книге.
const chapterThreeSpec: { n: number; title: string; from: number; to: number }[] = [
  { n: 1, title: "Часть 1", from: 1, to: 1 },
  { n: 2, title: "Часть 2", from: 2, to: 3 },
  { n: 3, title: "Части 3–4", from: 3, to: 4 },
  { n: 4, title: "Часть 5", from: 5, to: 5 },
  { n: 5, title: "Части 6–7", from: 6, to: 7 },
  { n: 6, title: "Часть 8", from: 8, to: 8 },
  { n: 7, title: "Часть 9", from: 9, to: 9 },
  { n: 8, title: "Часть 10", from: 10, to: 10 },
  { n: 9, title: "Части 11–12", from: 11, to: 12 },
  { n: 10, title: "Части 13–14", from: 13, to: 14 },
  { n: 11, title: "Часть 15", from: 15, to: 15 },
  { n: 12, title: "Часть 15", from: 15, to: 15 },
  { n: 13, title: "Часть 16", from: 16, to: 16 },
  { n: 14, title: "Часть 16", from: 16, to: 16 },
  { n: 15, title: "Часть 17", from: 17, to: 17 },
  { n: 16, title: "Часть 17", from: 17, to: 17 },
  { n: 17, title: "Часть 18", from: 18, to: 18 },
  { n: 18, title: "Часть 18", from: 18, to: 18 },
  { n: 19, title: "Часть 18", from: 18, to: 18 },
  { n: 20, title: "Часть 18", from: 18, to: 18 },
  { n: 25, title: "Часть 18", from: 18, to: 18 },
];

const chapterThree: Narration[] = chapterThreeSpec.map(({ n, title }) => ({
  id: `c3-${n}`,
  chapter: "Глава 3",
  title,
  src: `/chronicle/audio/chapter3_part${n}.mp3${n <= 21 ? "?v=2" : ""}`,
}));

export const narration: Narration[] = [...prologue, ...chapterOne, ...chapterTwo, ...chapterThree];

export function narrationFor(chapterId: string) {
  if (chapterId === "prolog") return prologue;
  if (chapterId === "glava-1") return chapterOne;
  if (chapterId.startsWith("g2-")) return chapterTwo;
  if (chapterId.startsWith("g3-")) {
    const part = Number(chapterId.slice(3));
    return chapterThree.filter((_, index) => {
      const spec = chapterThreeSpec[index];
      return spec.from <= part && part <= spec.to;
    });
  }
  return [];
}
