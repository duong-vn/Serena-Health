import './Pagination.css'

export type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  siblingCount?: number
}

function getVisiblePages(currentPage: number, totalPages: number, siblingCount: number) {
  const count = Math.min(totalPages, siblingCount)

  if (totalPages <= count) {
    return Array.from({ length: totalPages }, (_item, index) => index + 1)
  }

  const half = Math.floor(count / 2)
  const start = Math.min(Math.max(1, currentPage - half), totalPages - count + 1)

  return Array.from({ length: count }, (_item, index) => start + index)
}

export function Pagination({ currentPage, totalPages, onPageChange, className = '', siblingCount = 3 }: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const visiblePages = getVisiblePages(currentPage, totalPages, siblingCount)

  return (
    <div className={['pagination', className].filter(Boolean).join(' ')} aria-label="Phân trang">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        aria-label="Trang trước"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15.5 5 8.5 12l7 7" />
        </svg>
      </button>
      {visiblePages.map((page) => (
        <button
          type="button"
          className={page === currentPage ? 'active' : undefined}
          key={page}
          onClick={() => onPageChange(page)}
          aria-label={`Trang ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        aria-label="Trang sau"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m8.5 5 7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
