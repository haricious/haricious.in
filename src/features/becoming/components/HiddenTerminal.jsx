import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { becomingArchive } from "../content";

const commandLinks = {
  dreams: "/dreams",
  failures: "/failures",
  timeline: "/timeline",
  future: "/dreams"
};

export function HiddenTerminal() {
  const [open, setOpen] = useState(false);
  const [command, setCommand] = useState("help");
  const output = useMemo(() => becomingArchive.terminalCommands[command.trim().toLowerCase()] || "Unknown command. Type help.", [command]);
  const target = commandLinks[command.trim().toLowerCase()];

  return (
    <aside className={`hidden-terminal ${open ? "open" : ""}`} aria-label="Discoverable terminal">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        &gt;_
      </button>
      {open && (
        <form className="terminal-console pcb-card" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="hidden-terminal-command">// COMMAND</label>
          <input id="hidden-terminal-command" value={command} onChange={(event) => setCommand(event.target.value)} autoComplete="off" />
          <output>{output}</output>
          {target && <Link to={target}>open {target}</Link>}
        </form>
      )}
    </aside>
  );
}
