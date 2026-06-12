import { useMemo, useState } from "react";
import { becomingArchive } from "../content";

function makeFallbackTree(projectTitle) {
  return {
    project: projectTitle,
    question: `What reasoning shaped ${projectTitle}?`,
    nodes: [
      { id: "start", label: "Start with the learning goal and the constraint that made the project worth building.", next: ["tradeoffs"] },
      { id: "tradeoffs", label: "Compare tools, effort, visibility into the concept, and what failure would teach.", next: ["final"] },
      { id: "final", label: "Final decision: choose the path that exposes the engineering idea most clearly.", next: ["lesson"] },
      { id: "lesson", label: "Lesson: a project is a decision trail, not only an output.", next: [] }
    ]
  };
}

export function DecisionTree({ projectTitle }) {
  const tree = useMemo(() => becomingArchive.decisionTrees.find((item) => item.project === projectTitle) || makeFallbackTree(projectTitle), [projectTitle]);
  const [active, setActive] = useState(tree.nodes[0]?.id || "");
  const activeNode = tree.nodes.find((node) => node.id === active) || tree.nodes[0];

  return (
    <section className="detail-section pcb-card decision-tree" aria-labelledby="decision-tree-title">
      <h2 id="decision-tree-title">// DECISION TREE</h2>
      <p className="decision-question">{tree.question}</p>
      <div className="decision-layout">
        <div className="decision-nodes" role="list" aria-label={`${tree.project} decision nodes`}>
          {tree.nodes.map((node, index) => (
            <button className={node.id === active ? "active" : ""} type="button" key={node.id} onClick={() => setActive(node.id)} role="listitem">
              <span>{String(index + 1).padStart(2, "0")}</span>
              {node.label}
            </button>
          ))}
        </div>
        <article className="decision-active">
          <span className="mono-chip">{activeNode.id}</span>
          <p>{activeNode.label}</p>
          <div className="decision-links" aria-label="Next decision nodes">
            {activeNode.next.length ? activeNode.next.map((next) => (
              <button type="button" key={next} onClick={() => setActive(next)}>follow {next}</button>
            )) : <span>terminal lesson reached</span>}
          </div>
        </article>
      </div>
    </section>
  );
}
