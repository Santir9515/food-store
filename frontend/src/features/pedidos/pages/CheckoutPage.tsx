import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { useCartStore } from '@/store/cartStore'
import { useCrearPedido } from '../hooks/usePedidos'
import { handleApiError } from '@/shared/api/handleApiError'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Input, Select, Textarea, errorDeCampo } from '@/shared/ui/Input'
import { EstadoError } from '@/shared/components/EstadoError'
import { formatearPrecio } from '@/shared/utils'
import type { FormaPago } from '../types/pedido'

export function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const vaciar = useCartStore((s) => s.vaciar)
  const total = items.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0)
  const crear = useCrearPedido()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [creado, setCreado] = useState(false)

  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO' as FormaPago, notas: '' },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await crear.mutateAsync({
          items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega.trim(),
          notas: value.notas.trim() || null,
        })
        setCreado(true)
        vaciar()
        navigate('/mis-pedidos')
      } catch (e) {
        setError(handleApiError(e, 'No se pudo crear el pedido'))
      }
    },
  })

  if (items.length === 0 && !creado) return <Navigate to="/carrito" replace />

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <h1 className="mb-4 text-xl font-bold">Datos de entrega</h1>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          <form.Field
            name="direccion_entrega"
            validators={{ onChange: ({ value }) => (value.trim().length >= 5 && value.trim().length <= 200 ? undefined : 'Entre 5 y 200 caracteres') }}
          >
            {(field) => <Input label="Dirección de entrega" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} error={errorDeCampo(field)} />}
          </form.Field>
          <form.Field name="forma_pago">
            {(field) => (
              <Select label="Forma de pago" value={field.state.value} onChange={(e) => field.handleChange(e.target.value as FormaPago)}>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </Select>
            )}
          </form.Field>
          <form.Field name="notas">
            {(field) => <Textarea label="Notas (opcional)" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />}
          </form.Field>
          {error && <EstadoError mensaje={error} />}
          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(enviando) => (
              <Button type="submit" className="w-full" disabled={enviando}>
                {enviando ? 'Confirmando…' : 'Confirmar pedido'}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </Card>
      <Card className="h-fit p-6">
        <h2 className="mb-3 text-lg font-bold">Resumen</h2>
        <ul className="space-y-1 text-sm">
          {items.map((i) => (
            <li key={i.producto_id} className="flex justify-between">
              <span>{i.cantidad} × {i.nombre}</span>
              <span>{formatearPrecio(i.precio_unitario * i.cantidad)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-gray-200 pt-3 text-right text-lg font-bold">Total: {formatearPrecio(total)}</p>
        <Link to="/carrito" className="text-sm text-brand-700 hover:underline">Volver al carrito</Link>
      </Card>
    </div>
  )
}
