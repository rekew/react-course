const products = ['products'] as const
const categories = ['categories'] as const

export const queryKeys = {
  products: {
    all: products,
    list: () => [...products, 'list'] as const,
    detail: (id: number | string) =>
      [...products, 'detail', String(id)] as const,
  },
  categories: {
    all: categories,
    list: () => [...categories, 'list'] as const,
  },
}
