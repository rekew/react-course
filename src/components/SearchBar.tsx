import type { ChangeEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Input } from './ui/input.tsx'
import { Label } from './ui/label.tsx'

export default function SearchBar() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value

    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (value) next.set('q', value)
        else next.delete('q')
        next.delete('page')
        return next
      },
      { replace: true, preventScrollReset: true },
    )
  }

  return (
    <div className="w-full max-w-sm space-y-2">
      <Label htmlFor="product-search">Search products</Label>
      <Input
        id="product-search"
        type="search"
        placeholder="Search by title..."
        className="h-11"
        value={query}
        onChange={handleChange}
      />
    </div>
  )
}
