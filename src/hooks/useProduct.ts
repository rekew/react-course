import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../lib/queryKeys.ts'
import {
  ApiError,
  getProductById,
  type Product,
} from '../services/service.ts'

interface UseProductResult {
  product: Product | null
  loading: boolean
  error: string | null
  notFound: boolean
}

function parseProductId(id: string | undefined): number | null {
  if (!id || !/^\d+$/.test(id)) return null
  const numericId = Number(id)
  return Number.isInteger(numericId) && numericId > 0 ? numericId : null
}

export function useProduct(id: string | undefined): UseProductResult {
  const numericId = parseProductId(id)

  const query = useQuery({
    queryKey: queryKeys.products.detail(id ?? ''),
    queryFn: ({ signal }) => getProductById(numericId ?? '', signal),
    enabled: numericId !== null,
    retry: (failureCount, error) =>
      error instanceof ApiError && error.status === 404
        ? false
        : failureCount < 2,
  })

  if (numericId === null) {
    return { product: null, loading: false, error: null, notFound: true }
  }

  const notFound =
    query.isError &&
    query.error instanceof ApiError &&
    query.error.status === 404

  return {
    product: query.data ?? null,
    loading: query.isPending,
    error:
      query.isError && !notFound
        ? query.error instanceof Error
          ? query.error.message
          : 'Failed to load product'
        : null,
    notFound,
  }
}
