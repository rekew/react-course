import ProductCard from '../components/ProductCard.tsx'
import { Button } from '../components/ui/button.tsx'
import { useProducts } from '../hooks/useProducts.ts'

export default function ProductsPage() {
  const { products, loading, error, refetch } = useProducts()

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground">Browse our product catalog.</p>
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

      {!loading && !error && products.length === 0 && (
        <p className="text-sm text-muted-foreground">No products found.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}
