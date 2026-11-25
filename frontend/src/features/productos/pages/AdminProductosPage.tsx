import { useMemo, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { createColumnHelper, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { useActualizarProducto, useActualizarStock, useCrearProducto, useEliminarProducto, useProductos } from '../hooks/useProductos'
import { useCategorias } from '@/features/categorias/hooks/useCategorias'
import type { Producto } from '../types/producto'
import { handleApiError } from '@/shared/api/handleApiError'
import { Button } from '@/shared/ui/Button'
import { Input, Select, Textarea, errorDeCampo } from '@/shared/ui/Input'
import { Modal } from '@/shared/ui/Modal'
import { TablaDatos } from '@/shared/components/TablaDatos'
import { SkeletonTabla } from '@/shared/components/Skeleton'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { EstadoError } from '@/shared/components/EstadoError'
import { formatearPrecio } from '@/shared/utils'

const col = createColumnHelper<Producto>()

function FormProducto({ inicial, onCerrar }: { inicial: Producto | null; onCerrar: () => void }) {
  const { data: categorias } = useCategorias()
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const [error, setError] = useState<string | null>(null)
  const activas = categorias?.filter((c) => c.activo) ?? []

  const form = useForm({
    defaultValues: {
      categoria_id: inicial?.categoria_id ?? activas[0]?.id ?? 0,
      nombre: inicial?.nombre ?? '',
      descripcion: inicial?.descripcion ?? '',
      precio_base: inicial?.precio_base ?? 0,
      imagen_url: inicial?.imagen_url ?? '',
      stock: inicial?.stock ?? 0,
      disponible: inicial?.disponible ?? true,
    },
    onSubmit: async ({ value }) => {
      setError(null)
      const datos = {
        categoria_id: value.categoria_id,
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: value.precio_base,
        imagen_url: value.imagen_url.trim() || null,
        stock: value.stock,
        disponible: value.disponible,
      }
      try {
        if (inicial) await actualizar.mutateAsync({ id: inicial.id, datos })
        else await crear.mutateAsync(datos)
        onCerrar()
      } catch (e) {
        setError(handleApiError(e, 'No se pudo guardar el producto'))
      }
    },
  })

  return (
    <Modal titulo={inicial ? 'Editar producto' : 'Nuevo producto'} onClose={onCerrar} ancho="lg">
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void form.handleSubmit() }}>
        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field name="nombre" validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'Ingresá un nombre') }}>
            {(field) => <Input label="Nombre" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} error={errorDeCampo(field)} />}
          </form.Field>
          <form.Field name="categoria_id" validators={{ onChange: ({ value }) => (value > 0 ? undefined : 'Elegí una categoría') }}>
            {(field) => (
              <Select label="Categoría" value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))} error={errorDeCampo(field)}>
                {activas.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </Select>
            )}
          </form.Field>
          <form.Field name="precio_base" validators={{ onChange: ({ value }) => (value >= 0 ? undefined : 'No puede ser negativo') }}>
            {(field) => <Input label="Precio" type="number" min={0} step="0.01" value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))} error={errorDeCampo(field)} />}
          </form.Field>
          <form.Field name="stock" validators={{ onChange: ({ value }) => (Number.isInteger(value) && value >= 0 ? undefined : 'Entero ≥ 0') }}>
            {(field) => <Input label="Stock" type="number" min={0} step="1" value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))} error={errorDeCampo(field)} />}
          </form.Field>
        </div>
        <form.Field name="imagen_url">
          {(field) => <Input label="URL de imagen (opcional)" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />}
        </form.Field>
        <form.Field name="descripcion">
          {(field) => <Textarea label="Descripción" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />}
        </form.Field>
        <form.Field name="disponible">
          {(field) => (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} /> Disponible para la venta
            </label>
          )}
        </form.Field>
        {error && <EstadoError mensaje={error} />}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCerrar}>Cancelar</Button>
          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(enviando) => <Button type="submit" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar'}</Button>}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  )
}

function FormStock({ producto, onCerrar }: { producto: Producto; onCerrar: () => void }) {
  const actualizar = useActualizarStock()
  const [error, setError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: { stock: producto.stock, disponible: producto.disponible },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await actualizar.mutateAsync({ id: producto.id, datos: value })
        onCerrar()
      } catch (e) {
        setError(handleApiError(e, 'No se pudo actualizar el stock'))
      }
    },
  })
  return (
    <Modal titulo={`Stock de ${producto.nombre}`} onClose={onCerrar}>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void form.handleSubmit() }}>
        <form.Field name="stock" validators={{ onChange: ({ value }) => (Number.isInteger(value) && value >= 0 ? undefined : 'Entero ≥ 0') }}>
          {(field) => <Input label="Stock" type="number" min={0} step="1" value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))} error={errorDeCampo(field)} />}
        </form.Field>
        <form.Field name="disponible">
          {(field) => (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} /> Disponible
            </label>
          )}
        </form.Field>
        {error && <EstadoError mensaje={error} />}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCerrar}>Cancelar</Button>
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </Modal>
  )
}

export function AdminProductosPage() {
  // El panel pide hasta 100 productos y la tabla pagina/ordena del lado del cliente
  const { data, isLoading, isError, error } = useProductos({ skip: 0, limit: 100 })
  const eliminar = useEliminarProducto()
  const [editando, setEditando] = useState<Producto | null>(null)
  const [stockDe, setStockDe] = useState<Producto | null>(null)
  const [creando, setCreando] = useState(false)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  async function alEliminar(p: Producto) {
    if (!window.confirm(`¿Eliminar el producto "${p.nombre}"?`)) return
    setErrorAccion(null)
    try {
      await eliminar.mutateAsync(p.id)
    } catch (e) {
      setErrorAccion(handleApiError(e, 'No se pudo eliminar el producto'))
    }
  }

  const columnas = [
    col.accessor('id', { header: 'ID' }),
    col.accessor('nombre', { header: 'Nombre' }),
    col.accessor((p) => p.categoria.nombre, { id: 'categoria', header: 'Categoría' }),
    col.accessor('precio_base', { header: 'Precio', cell: (c) => formatearPrecio(c.getValue()) }),
    col.accessor('stock', { header: 'Stock' }),
    col.accessor('disponible', { header: 'Disponible', cell: (c) => (c.getValue() ? 'Sí' : 'No') }),
    col.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEditando(row.original)}>Editar</Button>
          <Button variant="secondary" size="sm" onClick={() => setStockDe(row.original)}>Stock</Button>
          <Button variant="danger" size="sm" onClick={() => alEliminar(row.original)}>Eliminar</Button>
        </div>
      ),
    }),
  ]

  const filas = useMemo(() => data?.items ?? [], [data])
  const table = useReactTable({
    data: filas,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button onClick={() => setCreando(true)}>Nuevo producto</Button>
      </div>
      {errorAccion && <EstadoError mensaje={errorAccion} />}
      {isError && <EstadoError mensaje={handleApiError(error, 'No se pudieron cargar los productos')} />}
      {isLoading ? <SkeletonTabla /> : table.getRowModel().rows.length === 0 ? <EstadoVacio mensaje="No hay productos." /> : <TablaDatos table={table} />}
      {(creando || editando) && <FormProducto inicial={editando} onCerrar={() => { setCreando(false); setEditando(null) }} />}
      {stockDe && <FormStock producto={stockDe} onCerrar={() => setStockDe(null)} />}
    </div>
  )
}
