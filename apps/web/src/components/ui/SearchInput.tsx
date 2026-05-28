import './SearchInput.css'

type SearchInputProps = {
  value: string
  placeholder: string
  ariaLabel?: string
  onChange: (value: string) => void
}

export function SearchInput({ value, placeholder, ariaLabel = placeholder, onChange }: SearchInputProps) {
  return (
    <label className="search-input">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m16.5 16.5 4 4" />
      </svg>
      <input
        aria-label={ariaLabel}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
