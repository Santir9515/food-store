import { useState } from 'react'
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos'
import { PedidoCard } from '../components/PedidoCard'
import { TRANSICIONES, type EstadoPedido } from '../types/pedido'
import { handleApiError } from '@/shared/api/handleApiError'
import { Button } from '@/shared/ui/Button'
import { Select } from '@/shared/ui/Input'
import { Paginacion } from '@/shared/components/Paginacion'
import { SkeletonTabla } from '@/shared/components/Skeleton'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { EstadoError } from '@/shared/components/EstadoError'

const POR_PAGINA = 10
const ACCION: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'Pasar a preparación',
  ENTREGADO: 'Marcar entregado',
  CANCELADO: 'Cancelar',
}

export function AdminPedidosPage() {
  const [pagina, setPagina] = useState(1)
  const [estado, setEstado] = useState<'' | EstadoPedido>('')
  const { data, isLoading, isError, error } = usePedidos({ skip: (pagina - 1) * POR_PAGINA, limit: POR_PAGINA, estado: estado || undefined })
  const cambiar = useCambiarEstadoPedido()
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  async function alCambiar(id: number, nuevo: EstadoPedido) {
    if (nuevo === 'CANCELADO' && !window.confirm(`¿Cancelar el pedido #${id}? Se devolverá el stock.`)) return
    setErrorAccion(null)
    try {
      await cambiar.mutateAsync({ id, estado: nuevo })
    } catch (e) {
      setErrorAccion(handleApiError(e, 'No se pudo cambiar el estado'))
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pedidos</h1>
      <div className="max-w-xs">
        <Select label="Filtrar por estado" value={estado} onChange={(e) => { setEstado(e.target.value as '' | EstadoPedido); setPagina(1) }}>
          <option value="">Todos</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_PREPARACION">En preparación</option>
          <option value="ENTREGADO">Entregado</option>
          <option value="CANCELADO">Cancelado</option>
        </Select>
      </div>
      {errorAccion && <EstadoError mensaje={errorAccion} />}
      {isError && <EstadoError mensaje={handleApiError(error, 'No se pudieron cargar los pedidos')} />}
      {isLoading ? (
        <SkeletonTabla />
      ) : data && data.items.length === 0 ? (
        <EstadoVacio mensaje="No hay pedidos para mostrar." />
      ) : (
        <div className="space-y-3">
          {data?.items.map((p) => (
            <PedidoCard
              key={p.id}
              pedido={p}
              extra={<span className="text-xs font-normal text-gray-500">(usuario #{p.usuario_id})</span>}
              acciones={TRANSICIONES[p.estado].map((sig) => (
                <Button key={sig} size="sm" variant={sig === 'CANCELADO' ? 'danger' : 'primary'} disabled={cambiar.isPending} onClick={() => alCambiar(p.id, sig)}>
                  {ACCION[sig]}
                </Button>
              ))}
            />
          ))}
        </div>
      )}
      {data && data.total > POR_PAGINA && <Paginacion pagina={pagina} totalPaginas={Math.ceil(data.total / POR_PAGINA)} onCambiar={setPagina} />}
    </div>
  )
}
