import { Link } from "react-router-dom";

export function RepositoryCard({ repo }) {
  return (
    <Link className="project-card pcb-card" to={`/repositories/${repo.slug}`}>
      <div className="card-topline"><span className="mono-chip">{repo.language}</span><span>{repo.stars} ★</span></div>
      <h2>{repo.title}</h2>
      <p>{repo.description}</p>
    </Link>
  );
}
