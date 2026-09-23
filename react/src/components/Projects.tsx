import { profile } from "../data/profile";

export default function Projects() {
  return (
    <section className="card" id="projects">
      <h2>Projects</h2>
      <div className="grid">
        {profile.projects.map((p) => (
          <article key={p.title} className="project">
            <h3>{p.title}</h3>
            <p>{p.description}</p>
            <div className="tags">
              {p.tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
