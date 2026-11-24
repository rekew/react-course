import { useEffect } from 'react'
import {
  fetchProductDetails,
  selectProductDetailsCurrentId,
  selectProductDetailsError,
  selectProductDetailsNotFound,
  selectProductDetailsProduct,
  selectProductDetailsStatus,
} from '../features/productDetails/productDetailsSlice.ts'
import { getProductCacheKey, type Product } from '../services/service.ts'
import { useAppDispatch, useAppSelector } from '../store/hooks.ts'

interface UseProductResult {
  product: Product | null
  loading: boolean
  error: string | null
  notFound: boolean
  cacheKey: string | null
}

function parseProductId(id: string | undefined): number | null {
  if (!id || !/^\d+$/.test(id)) return null
  const numericId = Number(id)
  return Number.isInteger(numericId) && numericId > 0 ? numericId : null
}

export function useProduct(id: string | undefined): UseProductResult {
  const numericId = parseProductId(id)
  const dispatch = useAppDispatch()
  const product = useAppSelector(selectProductDetailsProduct)
  const status = useAppSelector(selectProductDetailsStatus)
  const error = useAppSelector(selectProductDetailsError)
  const notFound = useAppSelector(selectProductDetailsNotFound)
  const currentId = useAppSelector(selectProductDetailsCurrentId)

  useEffect(() => {
    if (numericId === null) return

    void dispatch(fetchProductDetails(numericId))
  }, [dispatch, numericId])

  if (numericId === null) {
    return {
      product: null,
      loading: false,
      error: null,
      notFound: true,
      cacheKey: null,
    }
  }

  const isCurrent = currentId === numericId

  return {
    product: isCurrent ? product : null,
    loading: !isCurrent || status === 'idle' || status === 'loading',
    error: isCurrent ? error : null,
    notFound: isCurrent ? notFound : false,
    cacheKey: getProductCacheKey(numericId),
  }
}
