const BASE_URL = 'https://dummyjson.com'

export interface Product {
  id: number
  title: string
  description: string
  category: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  sku: string
  availabilityStatus: string
  brand?: string
  thumbnail: string
  images: string[]
}

export interface ProductsResponse {
  products: Product[]
  total: number
  skip: number
  limit: number
}

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, { signal })
  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Request failed: ${response.status} ${response.statusText}`,
    )
  }
  return response.json() as Promise<T>
}

export function getProducts(signal?: AbortSignal): Promise<ProductsResponse> {
  return request<ProductsResponse>('/products?limit=0', signal)
}

export function getProductById(
  id: number | string,
  signal?: AbortSignal,
): Promise<Product> {
  return request<Product>(`/products/${encodeURIComponent(id)}`, signal)
}

export function getCategories(signal?: AbortSignal): Promise<string[]> {
  return request<string[]>('/products/category-list', signal)
}
