import { useParams } from 'react-router-dom'

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>()

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Product Details</h1>
      <p className="text-muted-foreground">Product ID: {id}</p>
    </section>
  )
}
