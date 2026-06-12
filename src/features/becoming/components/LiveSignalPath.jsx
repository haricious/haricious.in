import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function labelFor(pathname) {
  if (pathname === "/") return "Home";
  return pathname.split("/").filter(Boolean).at(-1)?.replaceAll("-", " ") || "Home";
}

export function LiveSignalPath() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("live-signal-path") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    setPath((current) => {
      const nextNode = { path: location.pathname, label: labelFor(location.pathname) };
      const withoutDuplicateTail = current.at(-1)?.path === nextNode.path ? current : [...current, nextNode];
      const next = withoutDuplicateTail.slice(-9);
      sessionStorage.setItem("live-signal-path", JSON.stringify(next));
      return next;
    });
  }, [location.pathname]);

  return (
    <aside className={`signal-path-widget ${open ? "open" : ""}`} aria-label="Live signal path">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        signal path
      </button>
      {open && (
        <ol>
          {path.map((node, index) => (
            <li key={`${node.path}-${index}`}>
              <Link to={node.path}>{node.label}</Link>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}
