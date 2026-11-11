import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../lib/queryKeys.ts'
import { getCategories } from '../services/service.ts'

interface UseCategoriesResult {
  categories: string[]
  loading: boolean
}

export function useCategories(): UseCategoriesResult {
  const query = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: ({ signal }) => getCategories(signal),
  })

  return {
    categories: query.data
      ? [...query.data].sort((a, b) => a.localeCompare(b))
      : [],
    loading: query.isPending,
  }
}
