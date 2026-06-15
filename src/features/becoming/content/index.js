import archive from "./archive.json";

export const becomingArchive = archive;

export const becomingNav = [
  { label: "FAILURES", path: "/failures" },
  { label: "BECOMING", path: "/currently-becoming" },
  { label: "DREAMS", path: "/dreams" },
  { label: "CHANGED", path: "/what-changed-me" },
  { label: "LETTERS", path: "/letters" }
];

export const becomingSearchRecords = [
  ...archive.failures.map((entry) => ({
    kind: "FAILURE LOG",
    title: entry.title,
    summary: entry.whatHappened,
    date: entry.date,
    tags: entry.tags,
    path: "/failures"
  })),
  ...archive.dreams.map((entry) => ({
    kind: "DREAM",
    title: entry.title,
    summary: entry.why,
    date: "[2026.01.10]",
    tags: [entry.id, entry.status],
    path: "/dreams"
  })),
  ...archive.whatChangedMe.map((entry) => ({
    kind: "INFLUENCE",
    title: entry.title,
    summary: entry.whyItChangedMe,
    date: entry.date,
    tags: entry.tags,
    path: "/what-changed-me"
  })),
  ...archive.letters.map((entry) => ({
    kind: "LETTER",
    title: entry.title,
    summary: entry.letter,
    date: `[${entry.year}.01.01]`,
    tags: ["future-self", "reflection"],
    path: "/letters"
  }))
];
