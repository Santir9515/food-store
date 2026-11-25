import { useResumenPedidos } from '../hooks/usePedidos'
import { handleApiError } from '@/shared/api/handleApiError'
import { Card } from '@/shared/ui/Card'
import { Skeleton } from '@/shared/components/Skeleton'
import { EstadoError } from '@/shared/components/EstadoError'
import { formatearPrecio } from '@/shared/utils'

function Metrica({ titulo, valor }: { titulo: string; valor: string | number }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-semibold uppercase text-gray-500">{titulo}</p>
      <p className="mt-1 text-2xl font-bold">{valor}</p>
    </Card>
  )
}

export function AdminResumenPage() {
  const { data, isLoading, isError, error } = useResumenPedidos()
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Resumen</h1>
      {isError && <EstadoError mensaje={handleApiError(error, 'No se pudo cargar el resumen')} />}
      {isLoading && <div className="grid gap-4 sm:grid-cols-3"><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" /></div>}
      {data && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Metrica titulo="Pendientes" valor={data.pendientes} />
          <Metrica titulo="En preparación" valor={data.en_preparacion} />
          <Metrica titulo="Entregados" valor={data.entregados} />
          <Metrica titulo="Cancelados" valor={data.cancelados} />
          <Metrica titulo="Pedidos de hoy" valor={data.pedidos_hoy} />
          <Metrica titulo="Ingresos (entregados)" valor={formatearPrecio(data.ingresos_entregados)} />
        </div>
      )}
    </div>
  )
}
