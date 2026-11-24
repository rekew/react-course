import { useEffect } from 'react'
import {
  fetchCategories,
  selectCategoriesError,
  selectCategoriesStatus,
  selectSortedCategories,
} from '../features/categories/categoriesSlice.ts'
import { useAppDispatch, useAppSelector } from '../store/hooks.ts'

interface UseCategoriesResult {
  categories: string[]
  loading: boolean
  error: string | null
  retry: () => void
}

export function useCategories(): UseCategoriesResult {
  const dispatch = useAppDispatch()
  const categories = useAppSelector(selectSortedCategories)
  const status = useAppSelector(selectCategoriesStatus)
  const error = useAppSelector(selectCategoriesError)

  useEffect(() => {
    void dispatch(fetchCategories())
  }, [dispatch])

  return {
    categories,
    loading: status === 'idle' || status === 'loading',
    error,
    retry: () => {
      void dispatch(fetchCategories())
    },
  }
}
