import { useParams } from 'react-router-dom'
import { useProduct } from '../hooks/useProduct.ts'

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>()
  const { product, loading, error, notFound } = useProduct(id)

  if (loading) {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Loading product…
      </p>
    )
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {error}
      </p>
    )
  }

  if (notFound) {
    return <p className="text-sm text-muted-foreground">Product not found.</p>
  }

  if (!product) return null

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">{product.title}</h1>
    </section>
  )
}
