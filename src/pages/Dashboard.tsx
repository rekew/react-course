import { Link, useSearchParams } from 'react-router-dom'
import Breakdown from '../components/Breakdown.tsx'
import StatCard from '../components/StatCard.tsx'
import { Button, buttonVariants } from '../components/ui/button.tsx'
import { Label } from '../components/ui/label.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select.tsx'
import { useProducts } from '../hooks/useProducts.ts'
import { formatCategory } from '../lib/format.ts'
import type { Product } from '../services/service.ts'

const ALL = 'all'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

const numberFormatter = new Intl.NumberFormat('en-US')

function countBy(values: string[]) {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1
    return counts
  }, {})
}

export default function Dashboard() {
  const { products, loading, error, refetch } = useProducts()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedCategory = searchParams.get('category') ?? ''

  const categories = Array.from(
    new Set(products.map((product) => product.category)),
  ).sort((a, b) => a.localeCompare(b))

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products

  const totalProducts = filteredProducts.length
  const averagePrice =
    totalProducts > 0
      ? filteredProducts.reduce((sum, product) => sum + product.price, 0) /
        totalProducts
      : 0
  const averageRating =
    totalProducts > 0
      ? filteredProducts.reduce((sum, product) => sum + product.rating, 0) /
        totalProducts
      : 0
  const totalStock = filteredProducts.reduce(
    (sum, product) => sum + product.stock,
    0,
  )
  const mostExpensiveProduct = filteredProducts.reduce<Product | null>(
    (most, product) =>
      !most || product.price > most.price ? product : most,
    null,
  )

  const categoryBreakdown = Object.entries(
    countBy(filteredProducts.map((product) => product.category)),
  )
    .map(([category, value]) => ({
      label: formatCategory(category),
      value,
      href: `/products?category=${encodeURIComponent(category)}`,
    }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))

  const availabilityBreakdown = Object.entries(
    countBy(filteredProducts.map((product) => product.availabilityStatus)),
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))

  const topRatedProducts = [...filteredProducts]
    .sort((a, b) => b.rating - a.rating || a.title.localeCompare(b.title))
    .slice(0, 5)

  function handleCategoryChange(value: string | null) {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (value && value !== ALL) next.set('category', value)
        else next.delete('category')
        return next
      },
      { replace: true, preventScrollReset: true },
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            An overview of your product catalog.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
          <div className="w-full space-y-2 sm:w-56">
            <Label htmlFor="dashboard-category">Category</Label>
            <Select
              value={selectedCategory || ALL}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger
                id="dashboard-category"
                className="h-11 w-full"
                disabled={loading || categories.length === 0}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {formatCategory(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Link
            to="/products"
            className={buttonVariants({
              variant: 'outline',
              className: 'h-11',
            })}
          >
            All products
          </Link>
        </div>
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
          {selectedCategory
            ? 'No products match this category.'
            : 'No product data available.'}
        </p>
      )}

      {!loading && !error && totalProducts > 0 && (
        <>
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

          <div className="grid gap-4 lg:grid-cols-2">
            <Breakdown
              title="Products by category"
              items={categoryBreakdown}
              total={totalProducts}
            />
            <Breakdown
              title="Products by availability"
              items={availabilityBreakdown}
              total={totalProducts}
            />
          </div>

          <div className="rounded-xl border bg-card p-5 text-card-foreground">
            <h2 className="text-lg font-semibold tracking-tight">
              Top rated products
            </h2>
            <ol className="mt-4 space-y-3">
              {topRatedProducts.map((product, index) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-muted-foreground">{index + 1}.</span>
                    <Link
                      to={`/products/${product.id}`}
                      className="truncate font-medium hover:underline"
                    >
                      {product.title}
                    </Link>
                  </div>
                  <span className="shrink-0 text-muted-foreground">
                    ★ {product.rating.toFixed(1)}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
    </section>
  )
}
