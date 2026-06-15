import React from "react";

export default function LatestNotesModal({ show, notes = [], onClose }) {
  if (!show) return null;

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1200,
    padding: 20,
  };

  const boxStyle = {
    width: "min(720px, 96%)",
    background: "#0f1720",
    color: "#e6eef6",
    borderRadius: 8,
    padding: 18,
    boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
    fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
  };

  const noteStyle = {
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  };

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-label="Latest field notes">
      <div style={boxStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>&gt; Latest field notes</h3>
          <div>
            <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#9fb4c8", cursor: "pointer" }}>Close</button>
          </div>
        </div>

        <div>
          {notes.length ? notes.map((note) => (
            <article key={note.slug} style={noteStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h4 style={{ margin: 0 }}>{note.title}</h4>
                <time style={{ opacity: 0.8 }}>{note.date}</time>
              </div>
              <p style={{ margin: "6px 0 0 0", color: "#b9d3e6" }}>{note.summary}</p>
            </article>
          )) : <p>No recent notes found.</p>}
        </div>

        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <a href="/field-notes" style={{ color: "#dff3ff", textDecoration: "none" }}>View all field notes</a>
        </div>
      </div>
    </div>
  );
}
