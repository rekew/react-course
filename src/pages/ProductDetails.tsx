import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button, buttonVariants } from '../components/ui/button.tsx'
import { useProduct } from '../hooks/useProduct.ts'

function formatCategory(category: string) {
  return category
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function availabilityClass(status: string) {
  switch (status.toLowerCase()) {
    case 'in stock':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    case 'low stock':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
    case 'out of stock':
      return 'bg-destructive/10 text-destructive'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { product, loading, error, notFound } = useProduct(id)

  if (loading) {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Loading product…
      </p>
    )
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {error}
      </p>
    )
  }

  if (notFound) {
    return <p className="text-sm text-muted-foreground">Product not found.</p>
  }

  if (!product) return null

  const details = [
    { label: 'Category', value: formatCategory(product.category) },
    { label: 'Brand', value: product.brand || 'N/A' },
    { label: 'Rating', value: `${product.rating.toFixed(1)} / 5` },
    { label: 'Stock', value: `${product.stock} units` },
    { label: 'SKU', value: product.sku },
    { label: 'Availability', value: product.availabilityStatus },
    {
      label: 'Discount',
      value: `${product.discountPercentage.toFixed(1)}% off`,
    },
    { label: 'Price', value: `$${product.price.toFixed(2)}` },
  ]

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
        <Link
          to="/products"
          className={buttonVariants({ variant: 'secondary' })}
        >
          All products
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <img
          src={product.images[0] ?? product.thumbnail}
          alt={product.title}
          className="aspect-square w-full rounded-xl border bg-card object-contain p-4"
        />

        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {formatCategory(product.category)}
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {product.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              ★ {product.rating.toFixed(1)} / 5
            </p>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-bold">
                ${product.price.toFixed(2)}
              </span>
              <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                {product.discountPercentage.toFixed(1)}% off
              </span>
            </div>
            <p className="text-[1.0625rem] leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            {details.map((detail) => (
              <div
                key={detail.label}
                className="rounded-lg border bg-card p-3"
              >
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  {detail.label}
                </dt>
                <dd className="mt-1 text-sm font-medium">
                  {detail.label === 'Availability' ? (
                    <span
                      className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${availabilityClass(product.availabilityStatus)}`}
                    >
                      {detail.value}
                    </span>
                  ) : (
                    detail.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
