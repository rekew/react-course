import { useSearchParams } from 'react-router-dom'
import Filters from '../components/Filters.tsx'
import ProductCard from '../components/ProductCard.tsx'
import SearchBar from '../components/SearchBar.tsx'
import { Button } from '../components/ui/button.tsx'
import { useProducts } from '../hooks/useProducts.ts'

export default function ProductsPage() {
  const { products, loading, error, refetch } = useProducts()
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? ''
  const ratingParam = searchParams.get('rating')
  const parsedRating = ratingParam ? Number(ratingParam) : 0
  const minRating =
    Number.isFinite(parsedRating) ? parsedRating : 0
  const normalizedQuery = query.trim().toLowerCase()
  const normalizedCategory = category.trim().toLowerCase()
  const hasActiveSearch = normalizedQuery.length > 0
  const hasActiveFilters = normalizedCategory.length > 0 || minRating > 0

  const filteredProducts = products.filter((product) => {
    const matchesQuery =
      !normalizedQuery ||
      product.title.toLowerCase().includes(normalizedQuery)
    const matchesCategory =
      !normalizedCategory ||
      product.category.toLowerCase() === normalizedCategory
    const matchesRating = !minRating || product.rating >= minRating

    return matchesQuery && matchesCategory && matchesRating
  })

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Browse our product catalog.</p>
        </div>
        <SearchBar />
      </div>

      <Filters />

      {loading && (
        <p role="status" className="text-sm text-muted-foreground">
          Loading products…
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

      {!loading && !error && filteredProducts.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {hasActiveSearch || hasActiveFilters
            ? 'No products match your search or filters.'
            : 'No products found.'}
        </p>
      )}

      {!loading && !error && filteredProducts.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}
