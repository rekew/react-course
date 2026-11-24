import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  ApiError,
  getProductById,
  type Product,
} from '../../services/service.ts'

export type ProductDetailsStatus =
  | 'idle'
  | 'loading'
  | 'succeeded'
  | 'failed'

export interface ProductDetailsError {
  message: string
  notFound: boolean
}

export interface ProductDetailsState {
  product: Product | null
  status: ProductDetailsStatus
  error: string | null
  notFound: boolean
  requestId: string | null
  currentId: number | null
}

const initialState: ProductDetailsState = {
  product: null,
  status: 'idle',
  error: null,
  notFound: false,
  requestId: null,
  currentId: null,
}

export const fetchProductDetails = createAsyncThunk<
  Product,
  number,
  { rejectValue: ProductDetailsError }
>(
  'productDetails/fetch',
  async (id, { signal, rejectWithValue }) => {
    try {
      return await getProductById(id, signal)
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return rejectWithValue({
          message: 'Product not found',
          notFound: true,
        })
      }

      return rejectWithValue({
        message:
          error instanceof Error ? error.message : 'Failed to load product',
        notFound: false,
      })
    }
  },
  {
    condition: (id, { getState }) => {
      const { currentId, status } = (
        getState() as { productDetails: ProductDetailsState }
      ).productDetails

      if (currentId === id && (status === 'loading' || status === 'succeeded')) {
        return false
      }

      return true
    },
  },
)

const productDetailsSlice = createSlice({
  name: 'productDetails',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductDetails.pending, (state, action) => {
        state.status = 'loading'
        state.product = null
        state.error = null
        state.notFound = false
        state.requestId = action.meta.requestId
        state.currentId = action.meta.arg
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return

        state.status = 'succeeded'
        state.product = action.payload
        state.error = null
        state.notFound = false
        state.requestId = null
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return

        state.status = 'failed'
        state.product = null
        state.notFound = action.payload?.notFound ?? false
        state.error = action.payload?.notFound
          ? null
          : (action.payload?.message ??
            action.error.message ??
            'Failed to load product')
        state.requestId = null
      })
  },
})

export const productDetailsReducer = productDetailsSlice.reducer

export const selectProductDetailsProduct = (state: {
  productDetails: ProductDetailsState
}) => state.productDetails.product
export const selectProductDetailsStatus = (state: {
  productDetails: ProductDetailsState
}) => state.productDetails.status
export const selectProductDetailsError = (state: {
  productDetails: ProductDetailsState
}) => state.productDetails.error
export const selectProductDetailsNotFound = (state: {
  productDetails: ProductDetailsState
}) => state.productDetails.notFound
export const selectProductDetailsCurrentId = (state: {
  productDetails: ProductDetailsState
}) => state.productDetails.currentId
