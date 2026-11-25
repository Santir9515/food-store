import type { ReactNode } from 'react'
import type { Pedido } from '../types/pedido'
import { BadgeEstado } from '@/shared/ui/BadgeEstado'
import { Card } from '@/shared/ui/Card'
import { formatearFecha, formatearPrecio } from '@/shared/utils'

export function PedidoCard({ pedido, acciones, extra }: { pedido: Pedido; acciones?: ReactNode; extra?: ReactNode }) {
  return (
    <Card className="p-4" data-testid="pedido-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-bold">Pedido #{pedido.id} {extra}</p>
          <p className="text-xs text-gray-500">{formatearFecha(pedido.created_at)} · {pedido.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}</p>
        </div>
        <BadgeEstado estado={pedido.estado} />
      </div>
      <ul className="mt-3 space-y-1 text-sm text-gray-700">
        {pedido.items.map((d) => (
          <li key={d.producto_id} className="flex justify-between">
            <span>{d.cantidad} × {d.nombre_producto}</span>
            <span>{formatearPrecio(d.subtotal)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-gray-500">Entrega: {pedido.direccion_entrega}{pedido.notas ? ` · ${pedido.notas}` : ''}</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className="font-bold">Total: {formatearPrecio(pedido.total)}</span>
        <div className="flex gap-2">{acciones}</div>
      </div>
    </Card>
  )
}
