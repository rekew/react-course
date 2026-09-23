import { profile } from "../data/profile";

export default function Footer() {
  return (
    <footer className="footer">
      <small>© 2026 {profile.name} · Built with React + Vite</small>
    </footer>
  );
}
