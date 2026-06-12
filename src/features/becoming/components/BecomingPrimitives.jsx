import { useMemo, useState } from "react";

export function FeatureFrame({ eyebrow = "// BECOMING ARCHIVE", title, subtext, children }) {
  return (
    <section className="page-frame becoming-page">
      <header className="page-header">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{subtext}</p>
      </header>
      <div className="schematic-divider becoming-divider" aria-hidden="true">
        <span />
        <svg viewBox="0 0 120 22" role="img">
          <path d="M2 11h20l6-8 12 16 12-16 12 16 12-16 6 8h36" />
        </svg>
        <span />
      </div>
      {children}
    </section>
  );
}

export function FeatureSearch({ value, onChange, placeholder = "search archive" }) {
  return (
    <label className="becoming-search pcb-card">
      <span>// QUERY</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

export function SegmentedFilters({ filters, active, onChange, label = "Archive filter" }) {
  return (
    <div className="filter-bar" role="tablist" aria-label={label}>
      {filters.map((filter) => (
        <button className={filter === active ? "active" : ""} key={filter} onClick={() => onChange(filter)} type="button">
          {filter}
        </button>
      ))}
    </div>
  );
}

export function DataList({ label, items }) {
  if (!items?.length) return null;
  return (
    <div className="becoming-mini-list">
      <span className="section-label">{label}</span>
      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>
  );
}

export function ChipRow({ items = [] }) {
  return <div className="tag-row becoming-tags">{items.map((item) => <span key={item}>{item.replaceAll("-", " ")}</span>)}</div>;
}

export function useFilteredItems(items, fields, initialFilter = "ALL", categoryField = "category") {
  const filters = useMemo(() => ["ALL", ...Array.from(new Set(items.map((item) => item[categoryField]).filter(Boolean))).map((item) => item.toUpperCase())], [items, categoryField]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(initialFilter);

  const visible = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesFilter = filter === "ALL" || item[categoryField]?.toUpperCase() === filter;
      const haystack = fields.map((field) => {
        const value = item[field];
        return Array.isArray(value) ? value.join(" ") : value;
      }).join(" ").toLowerCase();
      return matchesFilter && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [items, fields, filter, query, categoryField]);

  return { query, setQuery, filter, setFilter, filters, visible };
}

export function EmptyState({ children = "No matching archive entry yet." }) {
  return <p className="empty-copy">{children}</p>;
}
