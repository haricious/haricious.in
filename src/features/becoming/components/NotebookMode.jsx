import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { becomingArchive } from "../content";

export function NotebookMode() {
  const location = useLocation();
  const [enabled, setEnabled] = useState(() => localStorage.getItem("engineering-notebook-mode") === "true");

  useEffect(() => {
    localStorage.setItem("engineering-notebook-mode", String(enabled));
    document.body.classList.toggle("notebook-mode", enabled);
    return () => document.body.classList.remove("notebook-mode");
  }, [enabled]);

  const notes = useMemo(() => {
    const scoped = becomingArchive.notebook.filter((note) => note.scope === location.pathname);
    return scoped.length ? scoped : becomingArchive.notebook.filter((note) => note.scope === "global");
  }, [location.pathname]);

  return (
    <>
      <button className={`notebook-toggle ${enabled ? "active" : ""}`} type="button" onClick={() => setEnabled((value) => !value)} aria-pressed={enabled}>
        Engineering Notebook Mode
      </button>
      {enabled && (
        <aside className="notebook-panel" aria-label="Engineering notebook annotations">
          {notes.map((note) => (
            <article className="pcb-card" key={`${note.scope}-${note.title}`}>
              <span className="section-label">// {note.title}</span>
              <p>{note.note}</p>
            </article>
          ))}
        </aside>
      )}
    </>
  );
}
