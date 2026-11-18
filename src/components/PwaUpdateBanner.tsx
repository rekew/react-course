import { usePwaUpdate } from '../hooks/usePwaUpdate.ts'
import { Button } from './ui/button.tsx'

export default function PwaUpdateBanner() {
  const { updateAvailable, applyUpdate } = usePwaUpdate()

  if (!updateAvailable) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-3 bottom-3 z-50 flex max-h-[calc(100dvh-1.5rem)] flex-wrap items-center gap-3 overflow-y-auto rounded-lg border bg-background px-4 py-3 text-sm shadow-lg sm:inset-x-auto sm:right-4 sm:bottom-4"
    >
      <span>A new version is available</span>
      <Button size="sm" onClick={applyUpdate}>
        Update
      </Button>
    </div>
  )
}
