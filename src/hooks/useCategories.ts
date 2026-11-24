import { useEffect } from 'react'
import {
  fetchCategories,
  selectCategoriesStatus,
  selectCategoryItems,
} from '../features/categories/categoriesSlice.ts'
import { useAppDispatch, useAppSelector } from '../store/hooks.ts'

interface UseCategoriesResult {
  categories: string[]
  loading: boolean
}

export function useCategories(): UseCategoriesResult {
  const dispatch = useAppDispatch()
  const items = useAppSelector(selectCategoryItems)
  const status = useAppSelector(selectCategoriesStatus)

  useEffect(() => {
    void dispatch(fetchCategories())
  }, [dispatch])

  return {
    categories: [...items].sort((a, b) => a.localeCompare(b)),
    loading: status === 'idle' || status === 'loading',
  }
}
