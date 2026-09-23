import { profile } from "../data/profile";

export default function Skills() {
  return (
    <section className="card" id="skills">
      <h2>Skills</h2>
      <ul className="pills">
        {profile.skills.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </section>
  );
}
