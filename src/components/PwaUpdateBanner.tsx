import { usePwaUpdate } from '../hooks/usePwaUpdate.ts'
import { Button } from './ui/button.tsx'

export default function PwaUpdateBanner() {
  const { updateAvailable, applyUpdate } = usePwaUpdate()

  if (!updateAvailable) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 bottom-4 z-50 flex max-w-[calc(100vw-2rem)] flex-wrap items-center gap-3 rounded-lg border bg-background px-4 py-3 text-sm shadow-lg"
    >
      <span>A new version is available</span>
      <Button size="sm" onClick={applyUpdate}>
        Update
      </Button>
    </div>
  )
}
