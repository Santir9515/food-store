import { useMemo, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { createColumnHelper, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { useActualizarCategoria, useCategorias, useCrearCategoria, useEliminarCategoria } from '../hooks/useCategorias'
import type { Categoria } from '../types/categoria'
import { handleApiError } from '@/shared/api/handleApiError'
import { Button } from '@/shared/ui/Button'
import { Input, errorDeCampo } from '@/shared/ui/Input'
import { Modal } from '@/shared/ui/Modal'
import { TablaDatos } from '@/shared/components/TablaDatos'
import { SkeletonTabla } from '@/shared/components/Skeleton'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { EstadoError } from '@/shared/components/EstadoError'

const col = createColumnHelper<Categoria>()

function FormCategoria({ inicial, onCerrar }: { inicial: Categoria | null; onCerrar: () => void }) {
  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria()
  const [error, setError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: { nombre: inicial?.nombre ?? '', descripcion: inicial?.descripcion ?? '' },
    onSubmit: async ({ value }) => {
      setError(null)
      const datos = { nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null }
      try {
        if (inicial) await actualizar.mutateAsync({ id: inicial.id, datos })
        else await crear.mutateAsync(datos)
        onCerrar()
      } catch (e) {
        setError(handleApiError(e, 'No se pudo guardar la categoría'))
      }
    },
  })
  return (
    <Modal titulo={inicial ? 'Editar categoría' : 'Nueva categoría'} onClose={onCerrar}>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void form.handleSubmit() }}>
        <form.Field name="nombre" validators={{ onChange: ({ value }) => (value.trim().length >= 2 ? undefined : 'Mínimo 2 caracteres') }}>
          {(field) => <Input label="Nombre" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} error={errorDeCampo(field)} />}
        </form.Field>
        <form.Field name="descripcion">
          {(field) => <Input label="Descripción" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />}
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

export function AdminCategoriasPage() {
  const { data, isLoading, isError, error } = useCategorias()
  const eliminar = useEliminarCategoria()
  const [editando, setEditando] = useState<Categoria | null>(null)
  const [creando, setCreando] = useState(false)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  async function alEliminar(c: Categoria) {
    if (!window.confirm(`¿Eliminar la categoría "${c.nombre}"?`)) return
    setErrorAccion(null)
    try {
      await eliminar.mutateAsync(c.id)
    } catch (e) {
      setErrorAccion(handleApiError(e, 'No se pudo eliminar la categoría'))
    }
  }

  const columnas = [
    col.accessor('id', { header: 'ID' }),
    col.accessor('nombre', { header: 'Nombre' }),
    col.accessor('descripcion', { header: 'Descripción', cell: (c) => c.getValue() ?? '—', enableSorting: false }),
    col.accessor('activo', { header: 'Estado', cell: (c) => (c.getValue() ? 'Activa' : 'Inactiva') }),
    col.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEditando(row.original)}>Editar</Button>
          <Button variant="danger" size="sm" onClick={() => alEliminar(row.original)}>Eliminar</Button>
        </div>
      ),
    }),
  ]

  // `data` debe tener referencia estable: si cambia en cada render, la tabla se reinicia en bucle
  const filas = useMemo(() => data?.filter((c) => c.activo) ?? [], [data])
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
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Button onClick={() => setCreando(true)}>Nueva categoría</Button>
      </div>
      {errorAccion && <EstadoError mensaje={errorAccion} />}
      {isError && <EstadoError mensaje={handleApiError(error, 'No se pudieron cargar las categorías')} />}
      {isLoading ? <SkeletonTabla /> : table.getRowModel().rows.length === 0 ? <EstadoVacio mensaje="No hay categorías." /> : <TablaDatos table={table} />}
      {(creando || editando) && <FormCategoria inicial={editando} onCerrar={() => { setCreando(false); setEditando(null) }} />}
    </div>
  )
}
