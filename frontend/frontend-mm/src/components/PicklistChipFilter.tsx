import { useMemo, useState } from 'react'
import type { PicklistItem } from '../types/matrimony'

interface PicklistChipFilterProps {
  label: string
  placeholder: string
  options: PicklistItem[]
  selectedItems: PicklistItem[]
  onChange: (items: PicklistItem[]) => void
  onApply?: () => void
  showChips?: boolean
}

export function PicklistChipFilter({
  label,
  placeholder,
  options,
  selectedItems,
  onChange,
  onApply,
  showChips = true,
}: PicklistChipFilterProps) {
  const [query, setQuery] = useState('')

  const suggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) {
      return []
    }

    const selectedNames = new Set(selectedItems.map((item) => item.name))

    return options
      .filter((item) => !selectedNames.has(item.name))
      .filter(
        (item) =>
          item.value.toLowerCase().includes(normalizedQuery) ||
          item.name.toLowerCase().includes(normalizedQuery),
      )
      .sort((first, second) => {
        const firstValue = first.value.toLowerCase()
        const secondValue = second.value.toLowerCase()
        const firstName = first.name.toLowerCase()
        const secondName = second.name.toLowerCase()

        const firstStartsWith = firstValue.startsWith(normalizedQuery) || firstName.startsWith(normalizedQuery)
        const secondStartsWith =
          secondValue.startsWith(normalizedQuery) || secondName.startsWith(normalizedQuery)

        if (firstStartsWith !== secondStartsWith) {
          return firstStartsWith ? -1 : 1
        }

        const firstIndex = Math.min(
          firstValue.indexOf(normalizedQuery) === -1 ? Number.MAX_SAFE_INTEGER : firstValue.indexOf(normalizedQuery),
          firstName.indexOf(normalizedQuery) === -1 ? Number.MAX_SAFE_INTEGER : firstName.indexOf(normalizedQuery),
        )

        const secondIndex = Math.min(
          secondValue.indexOf(normalizedQuery) === -1
            ? Number.MAX_SAFE_INTEGER
            : secondValue.indexOf(normalizedQuery),
          secondName.indexOf(normalizedQuery) === -1 ? Number.MAX_SAFE_INTEGER : secondName.indexOf(normalizedQuery),
        )

        if (firstIndex !== secondIndex) {
          return firstIndex - secondIndex
        }

        return firstValue.localeCompare(secondValue)
      })
      .slice(0, 8)
  }, [options, query, selectedItems])

  const addItem = (item: PicklistItem) => {
    onChange([...selectedItems, item])
    onApply?.()
    setQuery('')
  }

  const removeItem = (name: string) => {
    onChange(selectedItems.filter((item) => item.name !== name))
    onApply?.()
  }

  return (
    <div className="picklist-field">
      <label>
        {label}
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
        />
      </label>

      {suggestions.length > 0 && (
        <div className="picklist-suggestions" role="listbox" aria-label={`${label} suggestions`}>
          {suggestions.map((item) => (
            <button
              key={item.name}
              type="button"
              className="picklist-suggestion-button"
              onClick={() => addItem(item)}
            >
              {item.value}
            </button>
          ))}
        </div>
      )}

      {showChips && selectedItems.length > 0 && (
        <div className="chip-list" aria-label={`${label} selected chips`}>
          {selectedItems.map((item) => (
            <button
              key={item.name}
              type="button"
              className="chip-button"
              onClick={() => removeItem(item.name)}
            >
              {item.value} ×
            </button>
          ))}
        </div>
      )}
    </div>
  )
}