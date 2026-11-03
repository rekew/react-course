import { useEffect, useState } from 'react'
import { getProducts, type Product } from '../services/service.ts'

interface UseProductsResult {
  products: Product[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const refetch = () => {
    setReloadKey((key) => key + 1)
  }

  useEffect(() => {
    const controller = new AbortController()

    async function loadProducts() {
      try {
        setLoading(true)
        setError(null)
        const data = await getProducts(controller.signal)
        if (controller.signal.aborted) return
        setProducts(data.products)
      } catch (cause) {
        if (controller.signal.aborted) return
        setError(
          cause instanceof Error ? cause.message : 'Failed to load products',
        )
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadProducts()

    return () => controller.abort()
  }, [reloadKey])

  return { products, loading, error, refetch }
}
