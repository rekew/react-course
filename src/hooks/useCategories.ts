import { useEffect } from 'react'
import {
  fetchCategories,
  selectCategoriesStatus,
  selectSortedCategories,
} from '../features/categories/categoriesSlice.ts'
import { useAppDispatch, useAppSelector } from '../store/hooks.ts'

interface UseCategoriesResult {
  categories: string[]
  loading: boolean
}

export function useCategories(): UseCategoriesResult {
  const dispatch = useAppDispatch()
  const categories = useAppSelector(selectSortedCategories)
  const status = useAppSelector(selectCategoriesStatus)

  useEffect(() => {
    void dispatch(fetchCategories())
  }, [dispatch])

  return {
    categories,
    loading: status === 'idle' || status === 'loading',
  }
}
