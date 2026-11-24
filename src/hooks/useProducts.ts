import { useEffect } from 'react'
import {
  fetchProducts,
  selectProductItems,
  selectProductsError,
  selectProductsStatus,
} from '../features/products/productsSlice.ts'
import { getProductsCacheKey, type Product } from '../services/service.ts'
import { useAppDispatch, useAppSelector } from '../store/hooks.ts'

interface UseProductsResult {
  products: Product[]
  loading: boolean
  error: string | null
  refetch: () => void
  cacheKey: string
}

export function useProducts(): UseProductsResult {
  const dispatch = useAppDispatch()
  const products = useAppSelector(selectProductItems)
  const status = useAppSelector(selectProductsStatus)
  const error = useAppSelector(selectProductsError)

  useEffect(() => {
    void dispatch(fetchProducts())
  }, [dispatch])

  return {
    products,
    loading: status === 'idle' || status === 'loading',
    error,
    refetch: () => {
      void dispatch(fetchProducts())
    },
    cacheKey: getProductsCacheKey(),
  }
}
