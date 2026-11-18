import {
  clearApiCacheStatus,
  recordApiCacheStatus,
} from '../pwa/apiCacheStatus.ts'

const BASE_URL = 'https://dummyjson.com'
const PRODUCTS_LIST_PATH = '/products?limit=0'

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
  const url = `${BASE_URL}${path}`
  let response: Response

  try {
    response = await fetch(url, { signal })
  } catch (error) {
    clearApiCacheStatus(url)
    throw error
  }

  recordApiCacheStatus(url, response)

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Request failed: ${response.status} ${response.statusText}`,
    )
  }
  return response.json() as Promise<T>
}

export function getProductsCacheKey(): string {
  return `${BASE_URL}${PRODUCTS_LIST_PATH}`
}

export function getProductCacheKey(id: number): string {
  return `${BASE_URL}/products/${id}`
}

export function getProducts(signal?: AbortSignal): Promise<ProductsResponse> {
  return request<ProductsResponse>(PRODUCTS_LIST_PATH, signal)
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
