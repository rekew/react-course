import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Filters from '../components/Filters.tsx'
import CachedDataBanner from '../components/CachedDataBanner.tsx'
import Pagination from '../components/Pagination.tsx'
import ProductCard from '../components/ProductCard.tsx'
import SearchBar from '../components/SearchBar.tsx'
import { Button } from '../components/ui/button.tsx'
import {
  fetchProducts,
  selectProductListPage,
  selectProductsError,
  selectProductsStatus,
} from '../features/products/productsSlice.ts'
import { getProductsCacheKey } from '../services/service.ts'
import { useAppDispatch, useAppSelector } from '../store/hooks.ts'

const PAGE_SIZE = 12

export default function ProductsPage() {
  const status = useAppSelector(selectProductsStatus)
  const error = useAppSelector(selectProductsError)
  const dispatch = useAppDispatch()
  const loading = status === 'idle' || status === 'loading'
  const cacheKey = getProductsCacheKey()
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

  const parsedPage = pageParam ? Number(pageParam) : 1
  const requestedPage =
    Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1

  const {
    items: paginatedProducts,
    totalPages,
    currentPage,
    totalCount,
  } = useAppSelector((state) =>
    selectProductListPage(state, {
      query: normalizedQuery,
      category: normalizedCategory,
      minRating,
      sort,
      page: requestedPage,
      pageSize: PAGE_SIZE,
    }),
  )

  useEffect(() => {
    void dispatch(fetchProducts())
  }, [dispatch])

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
      { preventScrollReset: true },
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

      <CachedDataBanner cacheKey={cacheKey} />

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
          <Button
            variant="outline"
            onClick={() => {
              void dispatch(fetchProducts())
            }}
          >
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && totalCount === 0 && (
        <p className="text-sm text-muted-foreground">
          {hasActiveSearch || hasActiveFilters
            ? 'No products match your search or filters.'
            : 'No products found.'}
        </p>
      )}

      {!loading && !error && totalCount > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
