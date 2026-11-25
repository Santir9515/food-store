import { flexRender, type Table } from '@tanstack/react-table'
import { Paginacion } from '@/shared/components/Paginacion'

interface TablaDatosProps<T> {
  table: Table<T>
}

function indicador(orden: false | 'asc' | 'desc'): string {
  if (orden === 'asc') return ' ▲'
  if (orden === 'desc') return ' ▼'
  return ''
}

// Renderiza una tabla creada con useReactTable: cabeceras ordenables, filas y paginación del lado del cliente
export function TablaDatos<T>({ table }: TablaDatosProps<T>) {
  const { pageIndex } = table.getState().pagination
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-surface shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            {table.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((cabecera) => (
                  <th key={cabecera.id} className="px-4 py-3">
                    {cabecera.isPlaceholder ? null : cabecera.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={cabecera.column.getToggleSortingHandler()}
                        className="font-semibold uppercase hover:text-gray-900"
                      >
                        {flexRender(cabecera.column.columnDef.header, cabecera.getContext())}
                        {indicador(cabecera.column.getIsSorted())}
                      </button>
                    ) : (
                      flexRender(cabecera.column.columnDef.header, cabecera.getContext())
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((fila) => (
              <tr key={fila.id} className="border-t border-gray-200">
                {fila.getVisibleCells().map((celda) => (
                  <td key={celda.id} className="px-4 py-3 text-sm text-gray-700">
                    {flexRender(celda.column.columnDef.cell, celda.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Paginacion
        pagina={pageIndex + 1}
        totalPaginas={table.getPageCount()}
        onCambiar={(pagina) => table.setPageIndex(pagina - 1)}
      />
    </div>
  )
}
