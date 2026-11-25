import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { formatearPrecio } from '@/shared/utils'

export function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const quitar = useCartStore((s) => s.quitar)
  const vaciar = useCartStore((s) => s.vaciar)
  const total = useCartStore((s) => s.items.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0))
  const usuario = useAuthStore((s) => s.usuario)
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <EstadoVacio mensaje="Tu carrito está vacío.">
        <Link to="/" className="font-semibold text-brand-700 hover:underline">Ver el catálogo</Link>
      </EstadoVacio>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Carrito</h1>
      <Card className="divide-y divide-gray-200">
        {items.map((i) => (
          <div key={i.producto_id} className="flex flex-wrap items-center gap-3 p-4" data-testid="item-carrito">
            <div className="flex-1">
              <p className="font-semibold">{i.nombre}</p>
              <p className="text-sm text-gray-500">{formatearPrecio(i.precio_unitario)} c/u</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" aria-label="Restar" onClick={() => cambiarCantidad(i.producto_id, i.cantidad - 1)}>−</Button>
              <span className="w-8 text-center">{i.cantidad}</span>
              <Button variant="secondary" size="sm" aria-label="Sumar" disabled={i.cantidad >= i.stock} onClick={() => cambiarCantidad(i.producto_id, i.cantidad + 1)}>+</Button>
            </div>
            <span className="w-28 text-right font-semibold">{formatearPrecio(i.precio_unitario * i.cantidad)}</span>
            <Button variant="ghost" size="sm" onClick={() => quitar(i.producto_id)}>Quitar</Button>
          </div>
        ))}
      </Card>
      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={vaciar}>Vaciar carrito</Button>
        <div className="text-right">
          <p className="text-lg font-bold">Total: {formatearPrecio(total)}</p>
          <Button className="mt-2" onClick={() => navigate(usuario ? '/checkout' : '/login')}>
            {usuario ? 'Continuar al pago' : 'Ingresá para comprar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
