import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import './FilterButton.css'
import './FilterSelect.css'

export type FilterOption = {
  value: string
  label: string
}

export type FilterSelectProps = {
  options: FilterOption[]
  defaultValue?: string
  value?: string
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void
}

export function FilterSelect({ options, defaultValue, value, onChange }: FilterSelectProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [internalVal, setInternalVal] = useState(defaultValue || options[0]?.value)
  const [isOpen, setIsOpen] = useState(false)
  const currentVal = value !== undefined ? value : internalVal

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const handleSelectChange = (nextValue: string) => {
    if (value === undefined) {
      setInternalVal(nextValue)
    }
    onChange?.({ target: { value: nextValue } } as ChangeEvent<HTMLSelectElement>)
    setIsOpen(false)
  }

  const selectedLabel = options.find((option) => option.value === currentVal)?.label || 'Chọn...'

  return (
    <div className="filter-select-wrapper" ref={wrapperRef}>
      <button
        className="date-filter-button"
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <svg className="date-filter-menu-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 7h14M5 12h10M5 17h14" />
        </svg>
        <span>{selectedLabel}</span>
        <svg className="date-filter-chevron" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {isOpen ? (
        <div className="filter-select-menu soft-scrollbar" role="listbox">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={option.value === currentVal ? 'is-selected' : undefined}
              onClick={() => handleSelectChange(option.value)}
              role="option"
              aria-selected={option.value === currentVal}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
