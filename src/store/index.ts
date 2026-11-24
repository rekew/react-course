import { configureStore } from '@reduxjs/toolkit'
import { authReducer } from '../features/auth/authSlice.ts'
import { categoriesReducer } from '../features/categories/categoriesSlice.ts'
import { productDetailsReducer } from '../features/productDetails/productDetailsSlice.ts'
import { productsReducer } from '../features/products/productsSlice.ts'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoriesReducer,
    products: productsReducer,
    productDetails: productDetailsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
