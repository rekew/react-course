import { profile } from "../data/profile";

export default function About() {
  return (
    <section className="card" id="about">
      <h2>About Me</h2>
      {profile.bio.map((p) => (
        <p key={p.slice(0, 24)}>{p}</p>
      ))}
    </section>
  );
}
