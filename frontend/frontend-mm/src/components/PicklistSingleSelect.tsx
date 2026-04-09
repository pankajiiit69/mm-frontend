import { useMemo, useState } from 'react'
import type { PicklistItem } from '../types/matrimony'

interface PicklistSingleSelectProps {
  label: string
  placeholder: string
  options: PicklistItem[]
  selectedItem: PicklistItem | null
  onChange: (item: PicklistItem | null) => void
}

export function PicklistSingleSelect({
  label,
  placeholder,
  options,
  selectedItem,
  onChange,
}: PicklistSingleSelectProps) {
  const [query, setQuery] = useState('')
  const resolvedSelectedItem = useMemo(() => {
    if (!selectedItem) {
      return null
    }
    return options.find((option) => option.name === selectedItem.name) ?? selectedItem
  }, [options, selectedItem])

  const inputValue = resolvedSelectedItem?.value ?? query

  const suggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) {
      return []
    }

    return options
      .filter(
        (item) =>
          item.value.toLowerCase().includes(normalizedQuery) ||
          item.name.toLowerCase().includes(normalizedQuery),
      )
      .sort((first, second) => {
        const firstValue = first.value.toLowerCase()
        const secondValue = second.value.toLowerCase()
        const firstStartsWith = firstValue.startsWith(normalizedQuery)
        const secondStartsWith = secondValue.startsWith(normalizedQuery)

        if (firstStartsWith !== secondStartsWith) {
          return firstStartsWith ? -1 : 1
        }

        const firstIndex = firstValue.indexOf(normalizedQuery)
        const secondIndex = secondValue.indexOf(normalizedQuery)
        if (firstIndex !== secondIndex) {
          return firstIndex - secondIndex
        }

        return firstValue.localeCompare(secondValue)
      })
      .slice(0, 8)
  }, [options, query])

  const applySelection = (item: PicklistItem) => {
    onChange(item)
    setQuery('')
  }

  return (
    <div className="picklist-field">
      <label>
        {label}
        <input
          className="picklist-input"
          value={inputValue}
          onChange={(event) => {
            const nextValue = event.target.value
            setQuery(nextValue)
            if (
              resolvedSelectedItem &&
              nextValue.trim().toLowerCase() !== resolvedSelectedItem.value.toLowerCase()
            ) {
              onChange(null)
            }
          }}
          onBlur={() => {
            setTimeout(() => setQuery(''), 120)
          }}
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
              onClick={() => applySelection(item)}
            >
              {item.value}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}