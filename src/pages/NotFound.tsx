import { Link } from 'react-router-dom'
import { buttonVariants } from '../components/ui/button.tsx'

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-lg rounded-xl border bg-card p-8 text-center text-card-foreground sm:p-12">
        <p className="text-7xl font-black leading-none tracking-tighter sm:text-8xl">
          404
        </p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sorry, the page you’re looking for doesn’t exist or has been moved.
        </p>
        <Link to="/" className={buttonVariants({ className: 'mt-6' })}>
          Back to home
        </Link>
      </div>
    </section>
  )
}
