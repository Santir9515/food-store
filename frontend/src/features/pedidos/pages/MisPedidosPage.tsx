import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos'
import { PedidoCard } from '../components/PedidoCard'
import { handleApiError } from '@/shared/api/handleApiError'
import { Button } from '@/shared/ui/Button'
import { Paginacion } from '@/shared/components/Paginacion'
import { SkeletonTabla } from '@/shared/components/Skeleton'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { EstadoError } from '@/shared/components/EstadoError'

const POR_PAGINA = 10

export function MisPedidosPage() {
  const [pagina, setPagina] = useState(1)
  const { data, isLoading, isError, error } = usePedidos({ skip: (pagina - 1) * POR_PAGINA, limit: POR_PAGINA })
  const cancelar = useCancelarPedido()
  const [errorCancelar, setErrorCancelar] = useState<string | null>(null)

  async function alCancelar(id: number) {
    if (!window.confirm(`¿Cancelar el pedido #${id}? Se devolverá el stock.`)) return
    setErrorCancelar(null)
    try {
      await cancelar.mutateAsync(id)
    } catch (e) {
      setErrorCancelar(handleApiError(e, 'No se pudo cancelar el pedido'))
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Mis pedidos</h1>
      {errorCancelar && <EstadoError mensaje={errorCancelar} />}
      {isError && <EstadoError mensaje={handleApiError(error, 'No se pudieron cargar los pedidos')} />}
      {isLoading ? (
        <SkeletonTabla />
      ) : data && data.items.length === 0 ? (
        <EstadoVacio mensaje="Todavía no hiciste ningún pedido.">
          <Link to="/" className="font-semibold text-brand-700 hover:underline">Ir al catálogo</Link>
        </EstadoVacio>
      ) : (
        <div className="space-y-3">
          {data?.items.map((p) => (
            <PedidoCard
              key={p.id}
              pedido={p}
              acciones={p.estado === 'PENDIENTE' && <Button variant="danger" size="sm" onClick={() => alCancelar(p.id)} disabled={cancelar.isPending}>Cancelar pedido</Button>}
            />
          ))}
        </div>
      )}
      {data && data.total > POR_PAGINA && <Paginacion pagina={pagina} totalPaginas={Math.ceil(data.total / POR_PAGINA)} onCambiar={setPagina} />}
    </div>
  )
}
