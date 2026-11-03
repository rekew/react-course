import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Filters from '../components/Filters.tsx'
import Pagination from '../components/Pagination.tsx'
import ProductCard from '../components/ProductCard.tsx'
import SearchBar from '../components/SearchBar.tsx'
import { Button } from '../components/ui/button.tsx'
import { useProducts } from '../hooks/useProducts.ts'

const PAGE_SIZE = 12

export default function ProductsPage() {
  const { products, loading, error, refetch } = useProducts()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? ''
  const ratingParam = searchParams.get('rating')
  const sort = searchParams.get('sort') ?? ''
  const pageParam = searchParams.get('page')
  const parsedRating = ratingParam ? Number(ratingParam) : 0
  const minRating =
    Number.isFinite(parsedRating) && parsedRating > 0 ? parsedRating : 0
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

  const sortedProducts = [...filteredProducts]

  if (sort === 'price-asc') {
    sortedProducts.sort((a, b) => a.price - b.price)
  } else if (sort === 'price-desc') {
    sortedProducts.sort((a, b) => b.price - a.price)
  } else if (sort === 'rating-desc') {
    sortedProducts.sort((a, b) => b.rating - a.rating)
  } else if (sort === 'title-asc') {
    sortedProducts.sort((a, b) => a.title.localeCompare(b.title))
  }

  const parsedPage = pageParam ? Number(pageParam) : 1
  const requestedPage =
    Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / PAGE_SIZE))
  const currentPage = Math.min(requestedPage, totalPages)
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  useEffect(() => {
    if (loading || error) return

    const desiredPageParam = currentPage === 1 ? null : String(currentPage)
    if (pageParam === desiredPageParam) return

    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (desiredPageParam) next.set('page', desiredPageParam)
        else next.delete('page')
        return next
      },
      { replace: true, preventScrollReset: true },
    )
  }, [loading, error, currentPage, pageParam, setSearchParams])

  function handlePageChange(page: number) {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (page > 1) next.set('page', String(page))
        else next.delete('page')
        return next
      },
      { replace: true, preventScrollReset: true },
    )
  }

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

      {!loading && !error && sortedProducts.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {hasActiveSearch || hasActiveFilters
            ? 'No products match your search or filters.'
            : 'No products found.'}
        </p>
      )}

      {!loading && !error && sortedProducts.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {!loading && !error && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </section>
  )
}
