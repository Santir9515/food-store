import { useMemo, useState } from 'react'
import { createColumnHelper, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { useCambiarActivo, useUsuarios } from '../hooks/useUsuarios'
import type { Usuario } from '@/features/auth/types/auth'
import { useAuthStore } from '@/store/authStore'
import { handleApiError } from '@/shared/api/handleApiError'
import { Button } from '@/shared/ui/Button'
import { TablaDatos } from '@/shared/components/TablaDatos'
import { SkeletonTabla } from '@/shared/components/Skeleton'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { EstadoError } from '@/shared/components/EstadoError'
import { formatearFecha } from '@/shared/utils'

const col = createColumnHelper<Usuario>()

export function AdminUsuariosPage() {
  const { data, isLoading, isError, error } = useUsuarios()
  const cambiar = useCambiarActivo()
  const yo = useAuthStore((s) => s.usuario)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  async function alCambiar(u: Usuario) {
    setErrorAccion(null)
    try {
      await cambiar.mutateAsync({ id: u.id, activar: u.disabled })
    } catch (e) {
      setErrorAccion(handleApiError(e, 'No se pudo actualizar el usuario'))
    }
  }

  const columnas = [
    col.accessor('id', { header: 'ID' }),
    col.accessor('username', { header: 'Usuario' }),
    col.accessor('full_name', { header: 'Nombre' }),
    col.accessor('email', { header: 'Email' }),
    col.accessor('role', { header: 'Rol' }),
    col.accessor('created_at', { header: 'Alta', cell: (c) => formatearFecha(c.getValue()) }),
    col.accessor('disabled', { header: 'Estado', cell: (c) => (c.getValue() ? 'Desactivado' : 'Activo') }),
    col.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) =>
        row.original.id === yo?.id ? (
          <span className="text-xs text-gray-400">Tu cuenta</span>
        ) : (
          <Button variant={row.original.disabled ? 'primary' : 'danger'} size="sm" disabled={cambiar.isPending} onClick={() => alCambiar(row.original)}>
            {row.original.disabled ? 'Activar' : 'Desactivar'}
          </Button>
        ),
    }),
  ]

  const filas = useMemo(() => data ?? [], [data])
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
      <h1 className="text-2xl font-bold">Usuarios</h1>
      {errorAccion && <EstadoError mensaje={errorAccion} />}
      {isError && <EstadoError mensaje={handleApiError(error, 'No se pudieron cargar los usuarios')} />}
      {isLoading ? <SkeletonTabla /> : table.getRowModel().rows.length === 0 ? <EstadoVacio mensaje="No hay usuarios." /> : <TablaDatos table={table} />}
    </div>
  )
}
