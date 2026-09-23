import { profile } from "../data/profile";

export default function Contact() {
  return (
    <section className="card" id="contact">
      <h2>Contact</h2>
      <p>Best way to reach me is email — happy to chat about frontend work.</p>
      <ul className="contacts">
        {profile.contacts.map((c) => (
          <li key={c.label}>
            <span>{c.label}</span>
            <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
              {c.value}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
