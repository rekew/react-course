import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import { getProducts, type Product } from '../../services/service.ts'

export type ProductsStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface ProductsState {
  items: Product[]
  status: ProductsStatus
  error: string | null
  requestId: string | null
}

export interface ProductListFilters {
  query: string
  category: string
  minRating: number
  sort: string
}

export interface ProductListPageParams extends ProductListFilters {
  page: number
  pageSize: number
}

export interface ProductListPage {
  items: Product[]
  totalPages: number
  currentPage: number
  totalCount: number
}

const initialState: ProductsState = {
  items: [],
  status: 'idle',
  error: null,
  requestId: null,
}

export const fetchProducts = createAsyncThunk<
  Product[],
  void,
  { rejectValue: string }
>(
  'products/fetchList',
  async (_, { signal, rejectWithValue }) => {
    try {
      const response = await getProducts(signal)
      return response.products
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to load products',
      )
    }
  },
  {
    condition: (_, { getState }) => {
      const { status } = (getState() as { products: ProductsState }).products
      return status === 'idle' || status === 'failed'
    },
  },
)

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state, action) => {
        state.status = 'loading'
        state.error = null
        state.requestId = action.meta.requestId
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return

        state.status = 'succeeded'
        state.items = action.payload
        state.requestId = null
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return

        state.status = 'failed'
        state.error =
          action.payload ?? action.error.message ?? 'Failed to load products'
        state.requestId = null
      })
  },
})

export const productsReducer = productsSlice.reducer

export const selectProductItems = (state: { products: ProductsState }) =>
  state.products.items
export const selectProductsStatus = (state: { products: ProductsState }) =>
  state.products.status
export const selectProductsError = (state: { products: ProductsState }) =>
  state.products.error

export const selectFilteredSortedProducts = createSelector(
  [
    selectProductItems,
    (
      _state: { products: ProductsState },
      filters: ProductListFilters,
    ) => filters.query,
    (
      _state: { products: ProductsState },
      filters: ProductListFilters,
    ) => filters.category,
    (
      _state: { products: ProductsState },
      filters: ProductListFilters,
    ) => filters.minRating,
    (
      _state: { products: ProductsState },
      filters: ProductListFilters,
    ) => filters.sort,
  ],
  (items, query, category, minRating, sort) => {
    const filteredProducts = items.filter((product) => {
      const matchesQuery =
        !query || product.title.toLowerCase().includes(query)
      const matchesCategory =
        !category || product.category.toLowerCase() === category
      const matchesRating = !minRating || product.rating >= minRating

      return matchesQuery && matchesCategory && matchesRating
    })

    if (sort === 'price-asc') {
      filteredProducts.sort((a, b) => a.price - b.price)
    } else if (sort === 'price-desc') {
      filteredProducts.sort((a, b) => b.price - a.price)
    } else if (sort === 'rating-desc') {
      filteredProducts.sort((a, b) => b.rating - a.rating)
    } else if (sort === 'title-asc') {
      filteredProducts.sort((a, b) => a.title.localeCompare(b.title))
    }

    return filteredProducts
  },
)

export const selectProductListPage = createSelector(
  [
    (
      state: { products: ProductsState },
      params: ProductListPageParams,
    ) => selectFilteredSortedProducts(state, params),
    (
      _state: { products: ProductsState },
      params: ProductListPageParams,
    ) => params.page,
    (
      _state: { products: ProductsState },
      params: ProductListPageParams,
    ) => params.pageSize,
  ],
  (sortedProducts, requestedPage, pageSize): ProductListPage => {
    const totalPages = Math.max(
      1,
      Math.ceil(sortedProducts.length / pageSize),
    )
    const currentPage = Math.min(Math.max(1, requestedPage), totalPages)
    const start = (currentPage - 1) * pageSize

    return {
      items: sortedProducts.slice(start, start + pageSize),
      totalPages,
      currentPage,
      totalCount: sortedProducts.length,
    }
  },
)
