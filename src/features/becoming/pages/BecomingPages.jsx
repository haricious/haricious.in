import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Fuse from "fuse.js";
import { becomingArchive } from "../content";
import {
  ChipRow,
  DataList,
  EmptyState,
  FeatureFrame,
  FeatureSearch,
  SegmentedFilters,
  useFilteredItems
} from "../components/BecomingPrimitives";

export function JourneyPage() {
  const { query, setQuery, filter, setFilter, filters, visible } = useFilteredItems(
    becomingArchive.journey,
    ["title", "story", "year", "tags"],
    "ALL",
    "year"
  );
  const yearFilters = ["ALL", ...filters.slice(1).sort()];

  return (
    <FeatureFrame title="JOURNEY /" subtext="A chronological archive of engineering growth, preserved as milestones, lessons, challenges, and breakthroughs.">
      <FeatureSearch value={query} onChange={setQuery} placeholder="search verilog, fpga, first circuit..." />
      <SegmentedFilters filters={yearFilters} active={filter} onChange={setFilter} label="Journey year filter" />
      <div className="becoming-timeline">
        {visible.map((entry, index) => (
          <details className="journey-milestone pcb-card" key={entry.id} open={index === 0}>
            <summary>
              <span>{entry.date}</span>
              <strong>{entry.title}</strong>
              <em>{entry.year}</em>
            </summary>
            <p>{entry.story}</p>
            <div className="milestone-grid">
              <DataList label="// LESSONS" items={entry.lessons} />
              <DataList label="// CHALLENGES" items={entry.challenges} />
              <DataList label="// BREAKTHROUGHS" items={entry.breakthroughs} />
            <DataList label="// REFERENCES" items={entry.references} />
            </div>
            <ChipRow items={entry.tags} />
          </details>
        ))}
      </div>
      {!visible.length && <EmptyState />}
    </FeatureFrame>
  );
}

export function WhatChangedMePage() {
  const { query, setQuery, filter, setFilter, filters, visible } = useFilteredItems(
    becomingArchive.whatChangedMe,
    ["title", "description", "whyItChangedMe", "changedAfterward", "impact", "tags"],
    "ALL",
    "category"
  );
  const [view, setView] = useState("TIMELINE");

  return (
    <FeatureFrame title="WHAT_CHANGED_ME /" subtext="The invisible influences behind the journey: events, resources, failures, projects, conversations, and turning points that changed the direction.">
      <FeatureSearch value={query} onChange={setQuery} placeholder="search books, failures, projects, mentors..." />
      <SegmentedFilters filters={filters} active={filter} onChange={setFilter} label="Influence category filter" />
      <SegmentedFilters filters={["TIMELINE", "CARDS", "CAUSE-EFFECT"]} active={view} onChange={setView} label="Influence view mode" />
      {view === "TIMELINE" && (
        <div className="becoming-timeline">
          {visible.map((entry) => <InfluenceDetails entry={entry} key={entry.id} />)}
        </div>
      )}
      {view === "CARDS" && (
        <div className="influence-card-grid">
          {visible.map((entry) => (
            <article className="influence-card pcb-card" key={entry.id}>
              <div className="card-topline"><span className="mono-chip">{entry.category}</span><time>{entry.date}</time></div>
              <h2>{entry.title}</h2>
              <p>{entry.description}</p>
              <blockquote>{entry.whyItChangedMe}</blockquote>
              <ChipRow items={entry.tags} />
            </article>
          ))}
        </div>
      )}
      {view === "CAUSE-EFFECT" && (
        <div className="influence-cause-grid">
          {visible.map((entry) => (
            <section className="influence-chain pcb-card" key={entry.id}>
              <h2>{entry.title}</h2>
              <ol>
                {entry.chain.map((step) => <li key={step}>{step}</li>)}
              </ol>
            </section>
          ))}
        </div>
      )}
      {!visible.length && <EmptyState />}
    </FeatureFrame>
  );
}

function InfluenceDetails({ entry }) {
  return (
    <details className="journey-milestone influence-details pcb-card">
      <summary>
        <span>{entry.date}</span>
        <strong>{entry.title}</strong>
        <em>{entry.category}</em>
      </summary>
      <p>{entry.description}</p>
      <div className="influence-detail-grid">
        <article>
          <span className="section-label">// WHY DID THIS CHANGE ME?</span>
          <p>{entry.whyItChangedMe}</p>
        </article>
        <article>
          <span className="section-label">// WHAT CHANGED AFTERWARD</span>
          <p>{entry.changedAfterward}</p>
        </article>
        <article>
          <span className="section-label">// LONG-TERM IMPACT</span>
          <p>{entry.impact}</p>
        </article>
      </div>
      <ChipRow items={entry.tags} />
    </details>
  );
}

const starterQuestions = [
  "Why RTL?",
  "Why electronics?",
  "Biggest failure?",
  "Favorite project?",
  "What project taught you the most?",
  "What motivates you?",
  "How do you learn?",
  "Future goals?",
  "What would you do differently?",
  "Best lesson learned so far?"
];

function recordText(record) {
  return [
    record.kind,
    record.title,
    record.summary,
    record.outcome,
    record.lesson,
    record.domain,
    record.type,
    record.tags?.join(" "),
    record.details ? Object.values(record.details).flat().join(" ") : "",
    record.body?.join(" ")
  ].filter(Boolean).join(" ");
}

function buildAnswer(question, records) {
  const useful = records.slice(0, 4);
  const weak = !useful.length || (useful[0].score ?? 1) > 0.58;
  const prefix = weak ? "This is not documented in my archive. Based on the available information, here is my best inference. " : "";
  const joined = useful.map(({ item }) => item.summary || item.outcome || item.lesson || item.title).filter(Boolean);
  const themes = useful.map(({ item }) => item.title).join(", ");
  const lower = question.toLowerCase();

  if (!joined.length) {
    return {
      text: `${prefix}The archive currently documents a direction shaped by electronics, digital design, RTL, FPGA debugging, failure logs, and a habit of learning by building and writing.`,
      sources: []
    };
  }

  let lead = "The documented answer is that Hari's path is shaped by repeated movement from curiosity into concrete systems.";
  if (lower.includes("rtl")) lead = "RTL appears in the archive as the place where code, timing, registers, and hardware reality meet.";
  if (lower.includes("electronics")) lead = "Electronics matters because it gave the curiosity a physical layer: circuits, signals, devices, and systems.";
  if (lower.includes("failure") || lower.includes("differently")) lead = "The strongest documented failure theme is that clean simulation can hide missing hardware assumptions.";
  if (lower.includes("learn")) lead = "The archive describes learning as a loop: learn, build, break, debug, document, teach, repeat.";
  if (lower.includes("future") || lower.includes("goal") || lower.includes("dream")) lead = "The future direction documented in the archive points toward RTL, VLSI, chip design, and teaching engineering clearly.";
  if (lower.includes("project")) lead = "The projects are presented as evidence of thinking, not just finished outputs.";

  return {
    text: `${prefix}${lead} The most relevant archive signals are: ${joined.join(" ")} These sources point to this answer through ${themes}.`,
    sources: useful.map(({ item }) => item)
  };
}

export function InterviewHariPage({ knowledgeRecords = [] }) {
  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("interview-hari-messages") || "[]");
    } catch {
      return [];
    }
  });
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const searchable = useMemo(() => knowledgeRecords.map((record) => ({ ...record, searchText: recordText(record) })), [knowledgeRecords]);
  const fuse = useMemo(() => new Fuse(searchable, {
    includeScore: true,
    threshold: 0.52,
    keys: ["title", "summary", "outcome", "lesson", "tags", "domain", "type", "searchText"]
  }), [searchable]);

  function remember(nextMessages) {
    setMessages(nextMessages);
    sessionStorage.setItem("interview-hari-messages", JSON.stringify(nextMessages.slice(-12)));
  }

  function ask(question) {
    const trimmed = question.trim();
    if (!trimmed || streaming) return;
    const retrieved = fuse.search(trimmed).slice(0, 5);
    const answer = buildAnswer(trimmed, retrieved);
    const nextMessages = [...messages, { role: "visitor", text: trimmed }, { role: "hari", text: "", fullText: answer.text, sources: answer.sources }];
    remember(nextMessages);
    setDraft("");
    setStreaming(true);

    const words = answer.text.split(" ");
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setMessages((current) => {
        const clone = [...current];
        const last = clone[clone.length - 1];
        clone[clone.length - 1] = { ...last, text: words.slice(0, index).join(" ") };
        sessionStorage.setItem("interview-hari-messages", JSON.stringify(clone.slice(-12)));
        return clone;
      });
      if (index >= words.length) {
        window.clearInterval(timer);
        setStreaming(false);
      }
    }, 34);
  }

  return (
    <FeatureFrame title="INTERVIEW_HARI /" subtext="A local retrieval-based conversation with the documented engineering journey. No internet, no generic assistant, no invented personal history.">
      <section className="interview-layout">
        <div className="interview-panel pcb-card">
          <div className="starter-grid" aria-label="Suggested starter questions">
            {starterQuestions.map((question) => <button type="button" key={question} onClick={() => ask(question)}>{question}</button>)}
          </div>
          <div className="conversation-log" aria-live="polite">
            {messages.length === 0 && <p className="empty-copy">Ask about RTL, electronics, failures, learning, projects, motivation, or future goals.</p>}
            {messages.map((message, index) => (
              <article className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>
                <span className="section-label">// {message.role === "visitor" ? "visitor" : "archive response"}</span>
                <p>{message.text}</p>
                {message.sources?.length > 0 && (
                  <div className="source-citations">
                    {message.sources.map((source) => <Link to={source.path || "/"} key={`${source.kind}-${source.title}`}>{source.kind}: {source.title}</Link>)}
                  </div>
                )}
              </article>
            ))}
          </div>
          <form className="interview-form" onSubmit={(event) => {
            event.preventDefault();
            ask(draft);
          }}>
            <label htmlFor="interview-question">Ask the archive</label>
            <input id="interview-question" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Why RTL?" />
            <button className="pcb-button" type="submit" disabled={streaming}>[ ASK ]</button>
          </form>
        </div>
        <aside className="interview-rules pcb-card">
          <h2>// SYSTEM RULES</h2>
          <p>Answers are retrieved from documented site content only.</p>
          <p>If the archive does not contain enough information, the response must say that clearly before making a cautious inference.</p>
          <p>Conversation memory is stored only for this browser session.</p>
        </aside>
      </section>
    </FeatureFrame>
  );
}

export function FailuresPage() {
  const { query, setQuery, filter, setFilter, filters, visible } = useFilteredItems(
    becomingArchive.failures,
    ["title", "whatHappened", "whyItFailed", "tags"],
    "ALL",
    "category"
  );

  return (
    <FeatureFrame title="FAILURE_ARCHIVE /" subtext="A deliberately honest record of what broke, why it broke, and what changed after the lesson landed.">
      <FeatureSearch value={query} onChange={setQuery} placeholder="search debugging, interview, scope..." />
      <SegmentedFilters filters={filters} active={filter} onChange={setFilter} label="Failure category filter" />
      <div className="failure-grid">
        {visible.map((entry) => (
          <article className="failure-card pcb-card" key={entry.id}>
            <div className="card-topline"><span className="mono-chip">{entry.category}</span><time>{entry.date}</time></div>
            <h2>{entry.title}</h2>
            <dl>
              <dt>what happened</dt>
              <dd>{entry.whatHappened}</dd>
              <dt>why it failed</dt>
              <dd>{entry.whyItFailed}</dd>
              <dt>what i would do differently</dt>
              <dd>{entry.different}</dd>
            </dl>
            <DataList label="// LESSONS LEARNED" items={entry.lessons} />
            <ChipRow items={entry.tags} />
          </article>
        ))}
      </div>
      {!visible.length && <EmptyState />}
    </FeatureFrame>
  );
}

export function SourceCodeOfMePage() {
  return (
    <FeatureFrame title="SOURCE_CODE_OF_ME /" subtext="Personal growth presented as version history, dependencies, and current system configuration.">
      <div className="source-layout">
        <section className="source-editor pcb-card" aria-labelledby="version-history">
          <div className="editor-bar"><span /> <span /> <span /></div>
          <h2 id="version-history">// version-history.hari</h2>
          {becomingArchive.sourceCode.versions.map((entry) => (
            <article className="code-block-row" key={entry.version}>
              <span className="line-number">{entry.version}</span>
              <div>
                <h3>{entry.label}</h3>
                <p>{entry.date}</p>
                <ul>{entry.changes.map((change) => <li key={change}>{change}</li>)}</ul>
              </div>
            </article>
          ))}
        </section>
        <aside className="source-side">
          <section className="pcb-card">
            <h2>// dependencies.json</h2>
            <ChipRow items={becomingArchive.sourceCode.dependencies} />
          </section>
          <section className="pcb-card">
            <h2>// system.config</h2>
            {becomingArchive.sourceCode.configuration.map(([label, value]) => (
              <p className="config-row" key={label}><span>{label}</span>{value}</p>
            ))}
          </section>
        </aside>
      </div>
    </FeatureFrame>
  );
}

export function KnowledgeTreePage() {
  const [activeId, setActiveId] = useState("digital-design");
  const [zoom, setZoom] = useState(1);
  const active = becomingArchive.knowledgeTree.find((node) => node.id === activeId) || becomingArchive.knowledgeTree[0];
  const activePrereqs = new Set([active.id, ...active.prerequisites, ...active.children]);

  return (
    <FeatureFrame title="KNOWLEDGE_TREE /" subtext="An interactive map of learning progression, prerequisites, resources, and projects.">
      <div className="graph-controls pcb-card">
        <span className="section-label">// GRAPH SCALE</span>
        <input type="range" min="0.85" max="1.25" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} aria-label="Knowledge graph zoom" />
      </div>
      <div className="knowledge-layout">
        <div className="knowledge-graph pcb-card" style={{ "--graph-scale": zoom }}>
          {becomingArchive.knowledgeTree.map((node, index) => (
            <button
              className={`${node.id === active.id ? "active" : ""} ${activePrereqs.has(node.id) ? "lit" : ""}`}
              type="button"
              key={node.id}
              onClick={() => setActiveId(node.id)}
              style={{ "--node-index": index }}
            >
              {node.title}
            </button>
          ))}
        </div>
        <article className="knowledge-detail pcb-card">
          <span className="mono-chip">{active.id}</span>
          <h2>{active.title}</h2>
          <p>{active.description}</p>
          <DataList label="// PROJECTS" items={active.projects} />
          <DataList label="// LESSONS" items={active.lessons} />
          <DataList label="// RESOURCES" items={active.resources} />
          <DataList label="// PREREQUISITES" items={active.prerequisites.length ? active.prerequisites : ["root node"]} />
        </article>
      </div>
    </FeatureFrame>
  );
}

export function LearningHeatmapPage() {
  const [query, setQuery] = useState("");
  const [view, setView] = useState("YEAR");
  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return becomingArchive.heatmap.filter((entry) => !normalized || `${entry.topic} ${entry.tags.join(" ")} ${entry.date}`.toLowerCase().includes(normalized));
  }, [query]);
  const monthGroups = useMemo(() => {
    return visible.reduce((groups, entry) => {
      const key = entry.date.slice(0, 7);
      groups[key] = [...(groups[key] || []), entry];
      return groups;
    }, {});
  }, [visible]);

  return (
    <FeatureFrame title="LEARNING_HEATMAP /" subtext="A GitHub-inspired record of consistency, learning streaks, and the subjects that kept receiving attention.">
      <FeatureSearch value={query} onChange={setQuery} placeholder="search rtl, timing, fpga..." />
      <SegmentedFilters filters={["YEAR", "MONTH"]} active={view} onChange={setView} label="Heatmap view" />
      {view === "YEAR" ? (
        <div className="heatmap-grid pcb-card" aria-label="Yearly learning heatmap">
          {visible.map((entry) => (
            <button className={`heat-${entry.intensity}`} type="button" key={entry.date} title={`${entry.date}: ${entry.topic}`}>
              <span>{entry.date.slice(5)}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="month-groups">
          {Object.entries(monthGroups).map(([month, entries]) => (
            <section className="month-card pcb-card" key={month}>
              <h2>{month}</h2>
              {entries.map((entry) => <p key={entry.date}><time>{entry.date}</time>{entry.topic}</p>)}
            </section>
          ))}
        </div>
      )}
      {!visible.length && <EmptyState />}
    </FeatureFrame>
  );
}

export function CurrentlyBecomingPage() {
  return (
    <FeatureFrame title="CURRENTLY_BECOMING /" subtext="A current-state page for what is being learned, built, read, explored, struggled with, and tested.">
      <div className="currently-grid">
        {becomingArchive.currentlyBecoming.map(([label, value]) => (
          <article className="currently-card pcb-card" key={label}>
            <span className="section-label">// {label}</span>
            <p>{value}</p>
          </article>
        ))}
      </div>
    </FeatureFrame>
  );
}

export function DreamsPage() {
  return (
    <FeatureFrame title="DREAMS /" subtext="Long-term ambitions recorded with why they matter, current progress, milestones, and status.">
      <div className="dream-grid">
        {becomingArchive.dreams.map((dream) => (
          <article className="dream-card pcb-card" key={dream.id}>
            <div className="card-topline"><h2>{dream.title}</h2><span className="mono-chip">{dream.status}</span></div>
            <p><strong>Why it matters:</strong> {dream.why}</p>
            <p><strong>Current progress:</strong> {dream.progress}</p>
            <DataList label="// MILESTONES" items={dream.milestones} />
          </article>
        ))}
      </div>
    </FeatureFrame>
  );
}

export function ButterflyEffectPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = becomingArchive.butterflyEffect[activeIndex];

  return (
    <FeatureFrame title="BUTTERFLY_EFFECT /" subtext="A cause-and-effect map showing how small events gradually changed the direction of the life and work.">
      <div className="butterfly-layout">
        <div className="butterfly-chain pcb-card" aria-label="Cause and effect chain">
          {becomingArchive.butterflyEffect.map((node, index) => (
            <button className={index <= activeIndex ? "active" : ""} type="button" key={node.id} onClick={() => setActiveIndex(index)}>
              {node.title}
            </button>
          ))}
        </div>
        <article className="butterfly-story pcb-card">
          <span className="mono-chip">story mode {activeIndex + 1}/{becomingArchive.butterflyEffect.length}</span>
          <h2>{active.title}</h2>
          <p>{active.story}</p>
          <div className="replay-actions">
            <button type="button" onClick={() => setActiveIndex((value) => Math.max(0, value - 1))} disabled={activeIndex === 0}>Previous</button>
            <button type="button" onClick={() => setActiveIndex((value) => Math.min(becomingArchive.butterflyEffect.length - 1, value + 1))} disabled={activeIndex === becomingArchive.butterflyEffect.length - 1}>Next link</button>
          </div>
        </article>
      </div>
    </FeatureFrame>
  );
}

export function LettersPage() {
  return (
    <FeatureFrame title="LETTERS /" subtext="A yearly archive of letters to future self, with room for future responses when the next version arrives.">
      <div className="letters-stack">
        {becomingArchive.letters.map((letter) => (
          <article className="letter-card pcb-card" key={letter.id}>
            <time>{letter.year}</time>
            <h2>{letter.title}</h2>
            <p>{letter.letter}</p>
            <blockquote>{letter.futureResponse}</blockquote>
          </article>
        ))}
      </div>
      <section className="next-letter pcb-card">
        <h2>// NEXT LETTER SLOT</h2>
        <p>This archive is designed for yearly additions. Add the next letter in the content file; the page will render it automatically.</p>
      </section>
    </FeatureFrame>
  );
}

export function BecomingIndexLinks() {
  const links = [
    ["/journey", "Engineering Journey Timeline"],
    ["/failures", "Failure Archive"],
    ["/source-code-of-me", "Source Code of Me"],
    ["/knowledge-tree", "Knowledge Tree"],
    ["/learning-heatmap", "Learning Heatmap"],
    ["/currently-becoming", "Currently Becoming"],
    ["/dreams", "Dreams"],
    ["/butterfly-effect", "Butterfly Effect Map"],
    ["/what-changed-me", "What Changed Me?"],
    ["/interview-hari", "AI Interview Hari"],
    ["/letters", "Letters to Future Self"]
  ];
  return (
    <div className="becoming-index-links">
      {links.map(([path, label]) => <Link className="pcb-card" to={path} key={path}>{label}<span>-&gt;</span></Link>)}
    </div>
  );
}
