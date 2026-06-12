import { useMemo, useState } from "react";

const depthLabels = [
  ["level1", "30 Seconds"],
  ["level2", "5 Minutes"],
  ["level3", "30 Minutes"]
];

export function makeProjectDepth(project, details) {
  return {
    level1: [
      ["Problem", details.why],
      ["Solution", details.what],
      ["Outcome", project.outcome],
      ["Key Lesson", project.lesson]
    ],
    level2: [
      ["Background", details.why],
      ["Challenges", details.broke],
      ["Design Decisions", details.process],
      ["Results", project.outcome],
      ["Lessons Learned", details.learned]
    ],
    level3: [
      ["Full Story", `${details.why} ${details.process}`],
      ["Technical Implementation", details.what],
      ["Mistakes", details.broke],
      ["Alternative Approaches", details.different],
      ["Tradeoffs", "The useful tradeoff was choosing a project small enough to finish but strict enough to expose timing, tool, and hardware assumptions."],
      ["Reflection", details.learned],
      ["Future Improvements", details.different]
    ]
  };
}

export function makeNoteDepth(note, paragraphs) {
  const joined = paragraphs.join(" ");
  return {
    level1: [
      ["Problem", note.summary],
      ["Solution", "Slow down, preserve the observation, and turn the note into reusable learning evidence."],
      ["Outcome", `Archived as ${note.type.toLowerCase()}.`],
      ["Key Lesson", paragraphs[0] || note.summary]
    ],
    level2: [
      ["Background", note.summary],
      ["Challenges", joined.slice(0, 420)],
      ["Development Process", "The note records the thought process close to the moment where the lesson became clear."],
      ["Results", `Linked into the field notes archive with tags: ${(note.tags || []).join(", ")}.`],
      ["Lessons Learned", paragraphs.at(-1) || note.summary]
    ],
    level3: [
      ["Full Story", joined],
      ["Mistakes", note.type.includes("FAILURE") ? joined : "This note is not primarily a failure log, but it still preserves the assumptions and observations behind the learning."],
      ["Debugging Process", "Trace the claim, isolate the assumption, and write down what changed in the mental model."],
      ["Alternative Approaches", "The alternative would be to keep the lesson private and temporary. The archive makes it reusable."],
      ["Reflection", paragraphs.at(-1) || note.summary],
      ["Future Improvements", "Add more concrete examples, waveforms, sketches, or linked project evidence when available."]
    ]
  };
}

export function makeJourneyDepth(entry) {
  return {
    level1: [
      ["Problem", "A stage in the journey changed the direction or mental model."],
      ["Solution", entry.story],
      ["Outcome", entry.breakthroughs.join(" ")],
      ["Key Lesson", entry.lessons[0]]
    ],
    level2: [
      ["Background", entry.story],
      ["Challenges", entry.challenges.join(" ")],
      ["Design Decisions", "The important decision was to preserve the event as part of the learning archive instead of treating it as a passing memory."],
      ["Results", entry.breakthroughs.join(" ")],
      ["Lessons Learned", entry.lessons.join(" ")]
    ],
    level3: [
      ["Full Story", entry.story],
      ["Mistakes", entry.challenges.join(" ")],
      ["Debugging Process", "The entry records what was confusing, what became clearer, and what changed afterward."],
      ["Alternative Approaches", "Ignore the small event, or document it as evidence of becoming. The archive chooses documentation."],
      ["Tradeoffs", "Short timeline entries stay readable, while deeper entries preserve enough context for future expansion."],
      ["Reflection", entry.lessons.join(" ")],
      ["Future Improvements", "Attach images, references, project links, and later reflections as the archive grows."]
    ]
  };
}

export function ReadingDepth({ title = "Knowledge Compression", depths }) {
  const [active, setActive] = useState("level1");
  const rows = useMemo(() => depths?.[active] || [], [depths, active]);

  if (!depths) return null;

  return (
    <section className="detail-section pcb-card reading-depth" aria-labelledby="reading-depth-title">
      <div className="reading-depth-topline">
        <h2 id="reading-depth-title">// {title}</h2>
        <div role="tablist" aria-label="Reading depth">
          {depthLabels.map(([key, label]) => (
            <button className={active === key ? "active" : ""} type="button" role="tab" aria-selected={active === key} key={key} onClick={() => setActive(key)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="reading-depth-body" key={active}>
        {rows.map(([label, copy]) => (
          <article key={label}>
            <span className="section-label">// {label}</span>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
