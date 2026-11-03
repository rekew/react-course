import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard.tsx'
import SearchBar from '../components/SearchBar.tsx'
import { Button } from '../components/ui/button.tsx'
import { useProducts } from '../hooks/useProducts.ts'

export default function ProductsPage() {
  const { products, loading, error, refetch } = useProducts()
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const normalizedQuery = query.trim().toLowerCase()
  const filteredProducts = normalizedQuery
    ? products.filter((product) =>
        product.title.toLowerCase().includes(normalizedQuery),
      )
    : products

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Browse our product catalog.</p>
        </div>
        <SearchBar />
      </div>

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
          {normalizedQuery
            ? `No products match "${query.trim()}".`
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
