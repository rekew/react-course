import { profile } from "../data/profile";

export default function Hero() {
  return (
    <section className="hero card" id="top">
      <img className="avatar" src={profile.avatar} alt={`Portrait of ${profile.name}`} width={160} height={160} />
      <div>
        <p className="eyebrow">{profile.role}</p>
        <h1>{profile.name}</h1>
        <p className="tagline">{profile.tagline}</p>
        <div className="cta">
          <a className="btn primary" href="#contact">Get in touch</a>
          <a className="btn" href="#projects">See work</a>
        </div>
      </div>
    </section>
  );
}
