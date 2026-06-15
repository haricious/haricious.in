import React from "react";
import { Link } from "react-router-dom";

export default function LatestNotesModal({ show, notes = [], onClose }) {
  if (!show) return null;

  return (
    <div className="latest-notes-backdrop is-open" role="dialog" aria-modal="true" aria-label="Latest field notes">
      <div className="latest-notes-panel pcb-card">
        <div className="latest-notes-header">
          <h3>&gt; Latest field notes</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close latest notes">✕</button>
        </div>

        <div className="latest-notes-list">
          {notes.length ? notes.map((note) => (
            <Link to={`/field-notes/${note.slug}`} key={note.slug} className="latest-note-row" onClick={onClose}>
              <div className="latest-note-main">
                <h4 className="latest-note-title">{note.title}</h4>
                <p className="latest-note-summary">{note.summary}</p>
              </div>
              <time className="latest-note-time">{note.date}</time>
            </Link>
          )) : <p className="empty-copy">No recent notes found.</p>}
        </div>

        <div className="latest-notes-footer">
          <Link to="/field-notes" onClick={onClose} className="pcb-button">[ View all field notes ]</Link>
        </div>
      </div>
    </div>
  );
}
