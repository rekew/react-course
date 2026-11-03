import { Link } from 'react-router-dom'
import { buttonVariants } from '../components/ui/button.tsx'

const technologies = [
  'React',
  'TypeScript',
  'Vite',
  'React Router',
  'Tailwind CSS',
  'shadcn/ui',
  'DummyJSON API',
]

export default function About() {
  return (
    <section className="rounded-xl border bg-card p-6 text-card-foreground sm:p-8 lg:p-12">
      <div className="max-w-3xl space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            About
          </h1>
          <p className="text-[1.0625rem] leading-relaxed text-muted-foreground">
            The Product Catalog is a React course project for browsing products
            fetched from the DummyJSON API, exploring individual items, and
            viewing a simple dashboard.
          </p>
          <p className="text-[1.0625rem] leading-relaxed text-muted-foreground">
            It is built with a component-driven architecture, client-side
            routing, responsive layouts, and a focus on clean, accessible UI.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Technologies used
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {technologies.map((technology) => (
              <li
                key={technology}
                className="rounded-lg border bg-muted/40 px-4 py-2.5 text-sm font-medium"
              >
                {technology}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            to="/products"
            className={buttonVariants({
              variant: 'default',
              size: 'lg',
              className: 'h-11 w-full px-5 sm:w-auto',
            })}
          >
            Browse Products
          </Link>
          <a
            href="https://github.com/rekew/react-course/tree/hw5"
            target="_blank"
            className={buttonVariants({
              variant: 'outline',
              size: 'lg',
              className: 'h-11 w-full px-5 sm:w-auto',
            })}
          >
            GitHub Repository
          </a>
        </div>
      </div>
    </section>
  )
}
