interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onChange: (nextPage: number) => void
}

export function PaginationControls({ currentPage, totalPages, onChange }: PaginationControlsProps) {
  if (totalPages <= 1) return null

  return (
    <div className="pagination">
      <button disabled={currentPage === 1} onClick={() => onChange(currentPage - 1)}>
        Previous
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button disabled={currentPage === totalPages} onClick={() => onChange(currentPage + 1)}>
        Next
      </button>
    </div>
  )
}
