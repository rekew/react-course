import { useSearchParams } from 'react-router-dom'
import { useCategories } from '../hooks/useCategories.ts'
import { formatCategory } from '../lib/format.ts'
import { Button } from './ui/button.tsx'
import { Label } from './ui/label.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select.tsx'

const ALL = 'all'
const DEFAULT_SORT = 'default'

const ratingOptions = [
  { value: '4.5', label: '4.5 and up' },
  { value: '4', label: '4 and up' },
  { value: '3', label: '3 and up' },
  { value: '2', label: '2 and up' },
  { value: '1', label: '1 and up' },
]

const sortOptions = [
  { value: DEFAULT_SORT, label: 'Default' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Rating: High to Low' },
  { value: 'title-asc', label: 'Title: A-Z' },
]

export default function Filters() {
  const { categories, loading: categoriesLoading } = useCategories()
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') ?? ''
  const rating = searchParams.get('rating') ?? ''
  const sort = searchParams.get('sort') ?? ''
  const hasActiveFilters = Boolean(category) || Boolean(rating)

  function updateParam(
    key: 'category' | 'rating' | 'sort',
    value: string | null,
  ) {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (value) next.set(key, value)
        else next.delete(key)
        next.delete('page')
        return next
      },
      { replace: true, preventScrollReset: true },
    )
  }

  function resetFilters() {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        next.delete('category')
        next.delete('rating')
        next.delete('page')
        return next
      },
      { replace: true, preventScrollReset: true },
    )
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="w-full space-y-2 sm:w-56">
        <Label htmlFor="category-filter">Category</Label>
        <Select
          value={category || ALL}
          onValueChange={(value) =>
            updateParam('category', value === ALL ? null : value)
          }
        >
          <SelectTrigger
            id="category-filter"
            className="h-11 w-full"
            disabled={categoriesLoading}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {categories.map((option) => (
              <SelectItem key={option} value={option}>
                {formatCategory(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full space-y-2 sm:w-44">
        <Label htmlFor="rating-filter">Minimum rating</Label>
        <Select
          value={rating || ALL}
          onValueChange={(value) =>
            updateParam('rating', value === ALL ? null : value)
          }
        >
          <SelectTrigger id="rating-filter" className="h-11 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Any rating</SelectItem>
            {ratingOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full space-y-2 sm:w-52">
        <Label htmlFor="sort-filter">Sort by</Label>
        <Select
          value={sort || DEFAULT_SORT}
          onValueChange={(value) =>
            updateParam('sort', value === DEFAULT_SORT ? null : value)
          }
        >
          <SelectTrigger id="sort-filter" className="h-11 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-11"
        onClick={resetFilters}
        disabled={!hasActiveFilters}
      >
        Reset filters
      </Button>
    </div>
  )
}
