import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Wifi, WifiOff } from 'lucide-react'
import {
  fetchCategories,
  selectCategoriesStatus,
} from '../features/categories/categoriesSlice.ts'
import {
  fetchProductDetails,
  selectProductDetailsCurrentId,
  selectProductDetailsNotFound,
  selectProductDetailsStatus,
} from '../features/productDetails/productDetailsSlice.ts'
import {
  fetchProducts,
  selectProductsStatus,
} from '../features/products/productsSlice.ts'
import { useOnlineStatus } from '../hooks/useOnlineStatus.ts'
import { useAppDispatch, useAppSelector } from '../store/hooks.ts'

const TOAST_DURATION_MS = 4_000

interface ToastState {
  isOnline: boolean
  message: string
}

export default function ConnectivityStatus() {
  const { isOnline } = useOnlineStatus()
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()
  const productsStatus = useAppSelector(selectProductsStatus)
  const categoriesStatus = useAppSelector(selectCategoriesStatus)
  const productDetailsStatus = useAppSelector(selectProductDetailsStatus)
  const currentProductId = useAppSelector(selectProductDetailsCurrentId)
  const productNotFound = useAppSelector(selectProductDetailsNotFound)
  const [toast, setToast] = useState<ToastState | null>(null)
  const previousOnlineRef = useRef<boolean | null>(null)
  const toastTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const previousOnline = previousOnlineRef.current
    previousOnlineRef.current = isOnline

    if (previousOnline === null || previousOnline === isOnline) return

    if (isOnline) {
      void queryClient.refetchQueries({ type: 'active' })

      if (productsStatus === 'failed') {
        void dispatch(fetchProducts())
      }

      if (categoriesStatus === 'failed') {
        void dispatch(fetchCategories())
      }

      if (
        productDetailsStatus === 'failed' &&
        !productNotFound &&
        currentProductId !== null
      ) {
        void dispatch(fetchProductDetails(currentProductId))
      }
    }

    setToast({
      isOnline,
      message: isOnline
        ? 'You’re back online.'
        : 'You’re offline. Some features may be unavailable.',
    })

    if (toastTimeoutRef.current !== null) {
      window.clearTimeout(toastTimeoutRef.current)
    }

    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null)
      toastTimeoutRef.current = null
    }, TOAST_DURATION_MS)
  }, [
    isOnline,
    queryClient,
    dispatch,
    productsStatus,
    categoriesStatus,
    productDetailsStatus,
    currentProductId,
    productNotFound,
  ])

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current !== null) {
        window.clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [])

  return (
    <>
      <div className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-full border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
        <span
          aria-hidden="true"
          className={`size-2 rounded-full ${
            isOnline ? 'bg-emerald-500' : 'bg-destructive'
          }`}
        />
        {isOnline ? 'Online' : 'Offline'}
      </div>

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed inset-x-3 bottom-24 z-50 flex max-h-[calc(100dvh-1.5rem)] items-center gap-3 overflow-y-auto rounded-lg border bg-background px-4 py-3 text-sm shadow-lg sm:inset-x-auto sm:right-4 sm:bottom-20"
        >
          {toast.isOnline ? (
            <Wifi aria-hidden="true" className="size-4 text-emerald-600" />
          ) : (
            <WifiOff aria-hidden="true" className="size-4 text-destructive" />
          )}
          <span>{toast.message}</span>
        </div>
      ) : null}
    </>
  )
}
