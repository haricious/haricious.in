import { useState } from "react";
import { becomingArchive } from "../content";

export function HariOSPanel() {
  const [open, setOpen] = useState(false);

  return (
    <aside className={`harios-panel ${open ? "open" : ""}`} aria-label="HariOS system layer">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        HariOS
      </button>
      {open && (
        <div className="harios-card pcb-card">
          <div className="harios-topline">
            <span className="status-dot" aria-hidden="true" />
            <strong>system layer active</strong>
          </div>
          {becomingArchive.hariOS.map(([label, value]) => (
            <p key={label}><span>{label}</span>{value}</p>
          ))}
        </div>
      )}
    </aside>
  );
}
