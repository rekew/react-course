import { useEffect, useState } from 'react'
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

interface ProductResult {
  key: string | undefined
  product: Product | null
  error: string | null
  notFound: boolean
}

const EMPTY_RESULT: ProductResult = {
  key: undefined,
  product: null,
  error: null,
  notFound: false,
}

function parseProductId(id: string | undefined): number | null {
  if (!id || !/^\d+$/.test(id)) return null
  const numericId = Number(id)
  return Number.isInteger(numericId) && numericId > 0 ? numericId : null
}

export function useProduct(id: string | undefined): UseProductResult {
  const [result, setResult] = useState<ProductResult>(EMPTY_RESULT)
  const numericId = parseProductId(id)

  useEffect(() => {
    const productId = parseProductId(id)
    if (productId === null) return

    const controller = new AbortController()

    async function loadProduct(idToFetch: number) {
      try {
        const data = await getProductById(idToFetch, controller.signal)
        if (controller.signal.aborted) return
        setResult({
          key: id,
          product: data,
          error: null,
          notFound: false,
        })
      } catch (cause) {
        if (controller.signal.aborted) return
        if (cause instanceof ApiError && cause.status === 404) {
          setResult({
            key: id,
            product: null,
            error: null,
            notFound: true,
          })
          return
        }
        setResult({
          key: id,
          product: null,
          error:
            cause instanceof Error ? cause.message : 'Failed to load product',
          notFound: false,
        })
      }
    }

    loadProduct(productId)

    return () => controller.abort()
  }, [id])

  if (numericId === null) {
    return { product: null, loading: false, error: null, notFound: true }
  }

  if (result.key !== id) {
    return { product: null, loading: true, error: null, notFound: false }
  }

  return {
    product: result.product,
    loading: false,
    error: result.error,
    notFound: result.notFound,
  }
}
