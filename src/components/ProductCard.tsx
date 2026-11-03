import { Link } from 'react-router-dom'
import type { Product } from '../services/service.ts'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card text-card-foreground transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <img
        className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
        src={product.thumbnail}
        alt={product.title}
        loading="lazy"
      />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {product.category}
        </p>
        <h3 className="line-clamp-2 text-base font-semibold">{product.title}</h3>
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
          <span className="text-sm text-muted-foreground">
            ★ {product.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  )
}
