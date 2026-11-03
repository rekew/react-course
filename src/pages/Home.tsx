import { Link } from 'react-router-dom'
import { buttonVariants } from '../components/ui/button.tsx'

export default function Home() {
  return (
    <section className="grid items-center gap-8 rounded-xl border bg-card p-6 text-card-foreground sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
      <div className="flex max-w-lg flex-col gap-5">
        <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.25rem]">
          Discover your next favorite product
        </h1>
        <p className="text-[1.0625rem] leading-relaxed text-muted-foreground">
          Browse curated products, explore the details, and manage your catalog
          from one clean, responsive dashboard.
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
          <Link
            to="/dashboard"
            className={buttonVariants({
              variant: 'outline',
              size: 'lg',
              className: 'h-11 w-full px-5 sm:w-auto',
            })}
          >
            View Dashboard
          </Link>
        </div>
      </div>
      <img
        className="aspect-[4/3] w-full rounded-xl border object-cover"
        src="https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/1.webp"
        alt="Essence Mascara Lash Princess product"
      />
    </section>
  )
}
