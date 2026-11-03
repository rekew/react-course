import StatCard from '../components/StatCard.tsx'
import { Button } from '../components/ui/button.tsx'
import { useProducts } from '../hooks/useProducts.ts'
import type { Product } from '../services/service.ts'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

const numberFormatter = new Intl.NumberFormat('en-US')

export default function Dashboard() {
  const { products, loading, error, refetch } = useProducts()

  const totalProducts = products.length
  const averagePrice =
    totalProducts > 0
      ? products.reduce((sum, product) => sum + product.price, 0) /
        totalProducts
      : 0
  const averageRating =
    totalProducts > 0
      ? products.reduce((sum, product) => sum + product.rating, 0) /
        totalProducts
      : 0
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0)
  const mostExpensiveProduct = products.reduce<Product | null>(
    (most, product) =>
      !most || product.price > most.price ? product : most,
    null,
  )

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          An overview of your product catalog.
        </p>
      </div>

      {loading && (
        <p role="status" className="text-sm text-muted-foreground">
          Loading dashboard…
        </p>
      )}

      {!loading && error && (
        <div
          role="alert"
          className="flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-card p-6"
        >
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" onClick={refetch}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && totalProducts === 0 && (
        <p className="text-sm text-muted-foreground">
          No product data available.
        </p>
      )}

      {!loading && !error && totalProducts > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Total products"
            value={numberFormatter.format(totalProducts)}
          />
          <StatCard
            label="Average price"
            value={currencyFormatter.format(averagePrice)}
          />
          <StatCard
            label="Average rating"
            value={`${averageRating.toFixed(1)} / 5`}
          />
          <StatCard
            label="Total stock"
            value={`${numberFormatter.format(totalStock)} units`}
          />
          <StatCard
            label="Most expensive product"
            value={mostExpensiveProduct?.title ?? 'N/A'}
            hint={
              mostExpensiveProduct
                ? currencyFormatter.format(mostExpensiveProduct.price)
                : undefined
            }
          />
        </div>
      )}
    </section>
  )
}
