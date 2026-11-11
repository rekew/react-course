import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../lib/queryKeys.ts'
import { getProducts, type Product } from '../services/service.ts'

interface UseProductsResult {
  products: Product[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useProducts(): UseProductsResult {
  const query = useQuery({
    queryKey: queryKeys.products.list(),
    queryFn: ({ signal }) => getProducts(signal),
  })

  return {
    products: query.data?.products ?? [],
    loading: query.isPending,
    error: query.isError
      ? query.error instanceof Error
        ? query.error.message
        : 'Failed to load products'
      : null,
    refetch: () => {
      void query.refetch()
    },
  }
}
