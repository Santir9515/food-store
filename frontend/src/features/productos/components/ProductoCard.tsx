import type { Producto } from '../types/producto'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { formatearPrecio } from '@/shared/utils'

interface ProductoCardProps {
  producto: Producto
  onAgregar: (producto: Producto) => void
}

export function ProductoCard({ producto, onAgregar }: ProductoCardProps) {
  const sinStock = !producto.disponible || producto.stock <= 0
  return (
    <Card className="flex flex-col overflow-hidden" data-testid="producto-card">
      {producto.imagen_url ? (
        <img src={producto.imagen_url} alt={producto.nombre} className="h-36 w-full object-cover" />
      ) : (
        <div className="flex h-36 items-center justify-center bg-brand-50 text-4xl">🍽️</div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-semibold uppercase text-brand-700">{producto.categoria.nombre}</span>
        <h3 className="mt-1 font-bold">{producto.nombre}</h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-gray-500">{producto.descripcion}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold">{formatearPrecio(producto.precio_base)}</span>
          <span className={`text-xs ${sinStock ? 'text-red-600' : 'text-gray-500'}`}>{sinStock ? 'Sin stock' : `Stock: ${producto.stock}`}</span>
        </div>
        <Button className="mt-3" disabled={sinStock} onClick={() => onAgregar(producto)}>
          {sinStock ? 'No disponible' : 'Agregar al carrito'}
        </Button>
      </div>
    </Card>
  )
}
