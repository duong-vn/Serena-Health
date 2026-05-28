import React from 'react'
import './FilterButton.css'

type FilterButtonProps = {
  label: string
  onClick?: () => void
}

export function FilterButton({ label, onClick }: FilterButtonProps) {
  return (
    <button className="date-filter-button" type="button" onClick={onClick}>
      <svg className="date-filter-menu-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 7h14M5 12h10M5 17h14" />
      </svg>
      <span>{label}</span>
      <svg className="date-filter-chevron" viewBox="0 0 24 24" aria-hidden="true">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  )
}
