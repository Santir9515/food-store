import { Button } from '@/shared/ui/Button'

interface PaginacionProps {
  pagina: number // base 1
  totalPaginas: number
  onCambiar: (pagina: number) => void
}

export function Paginacion({ pagina, totalPaginas, onCambiar }: PaginacionProps) {
  const total = Math.max(totalPaginas, 1)
  return (
    <div className="flex items-center justify-between text-sm text-gray-600">
      <span>
        Página {pagina} de {total}
      </span>
      <div className="space-x-2">
        <Button variant="secondary" size="sm" onClick={() => onCambiar(pagina - 1)} disabled={pagina <= 1}>
          Anterior
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onCambiar(pagina + 1)} disabled={pagina >= total}>
          Siguiente
        </Button>
      </div>
    </div>
  )
}
