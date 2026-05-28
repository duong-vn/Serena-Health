import type { ReactNode } from 'react'
import './DataTable.css'

export type DataTableColumn<Row> = {
  key: string
  header: string
  width?: string
  align?: 'left' | 'center' | 'right'
  render: (row: Row, index: number) => ReactNode
}

type DataTableProps<Row> = {
  columns: Array<DataTableColumn<Row>>
  rows: Row[]
  emptyState: string
  getRowKey: (row: Row) => string
}

export function DataTable<Row>({ columns, rows, emptyState, getRowKey }: DataTableProps<Row>) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{ width: column.width }}
                className={column.align ? `align-${column.align}` : undefined}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row, rowIndex) => (
              <tr key={getRowKey(row)}>
                {columns.map((column) => (
                  <td key={column.key} className={column.align ? `align-${column.align}` : undefined}>
                    {column.render(row, rowIndex)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className="data-table-empty" colSpan={columns.length}>
                {emptyState}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
