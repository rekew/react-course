import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">404</h1>
      <p className="text-muted-foreground">Page not found.</p>
      <Link className="text-sm font-medium underline" to="/">
        Back to home
      </Link>
    </section>
  )
}
