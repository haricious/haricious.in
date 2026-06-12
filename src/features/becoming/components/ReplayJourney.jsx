import { useState } from "react";
import { Link } from "react-router-dom";
import { becomingArchive } from "../content";

export function ReplayJourney({ className = "" }) {
  const [open, setOpen] = useState(false);
  const [chapter, setChapter] = useState(0);
  const active = becomingArchive.replay[chapter];
  const progress = Math.round(((chapter + 1) / becomingArchive.replay.length) * 100);

  return (
    <>
      <button className={`pcb-button replay-launch ${className}`} type="button" onClick={() => setOpen(true)}>
        [ REPLAY MY JOURNEY ]
      </button>
      {open && (
        <div className="replay-overlay" role="dialog" aria-modal="true" aria-labelledby="replay-title">
          <section className="replay-stage pcb-card">
            <button className="replay-close" type="button" onClick={() => setOpen(false)} aria-label="Exit replay mode">Exit</button>
            <p className="eyebrow">// REPLAY MY JOURNEY</p>
            <h2 id="replay-title">{active.title}</h2>
            <p>{active.summary}</p>
            <div className="replay-progress" aria-label={`Replay progress ${progress} percent`}>
              <span style={{ width: `${progress}%` }} />
            </div>
            <nav className="replay-chapters" aria-label="Replay chapters">
              {becomingArchive.replay.map((item, index) => (
                <button className={index === chapter ? "active" : ""} type="button" key={item.chapter} onClick={() => setChapter(index)}>
                  {item.chapter}
                </button>
              ))}
            </nav>
            <div className="replay-actions">
              <button type="button" onClick={() => setChapter((value) => Math.max(0, value - 1))} disabled={chapter === 0}>Previous</button>
              <button type="button" onClick={() => setChapter((value) => Math.min(becomingArchive.replay.length - 1, value + 1))} disabled={chapter === becomingArchive.replay.length - 1}>Next</button>
              <Link to={active.path} onClick={() => setOpen(false)}>open chapter</Link>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
