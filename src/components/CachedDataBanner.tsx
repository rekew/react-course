import { useApiCacheStatus } from '../pwa/apiCacheStatus.ts'

interface CachedDataBannerProps {
  cacheKey: string | null
}

export default function CachedDataBanner({
  cacheKey,
}: CachedDataBannerProps) {
  const { isCached, lastUpdated } = useApiCacheStatus(cacheKey)

  if (!isCached || !lastUpdated) return null

  return (
    <p
      role="status"
      className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300"
    >
      You are viewing cached data (last updated:{' '}
      {lastUpdated.toLocaleString()}).
    </p>
  )
}
