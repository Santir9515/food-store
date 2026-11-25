import { useState } from 'react'
import { useCategorias } from '@/features/categorias/hooks/useCategorias'
import { useProductos } from '../hooks/useProductos'
import { ProductoCard } from '../components/ProductoCard'
import { useCartStore } from '@/store/cartStore'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { handleApiError } from '@/shared/api/handleApiError'
import { Paginacion } from '@/shared/components/Paginacion'
import { SkeletonTarjeta } from '@/shared/components/Skeleton'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { EstadoError } from '@/shared/components/EstadoError'
import { Input, Select } from '@/shared/ui/Input'
import type { Producto } from '../types/producto'

const POR_PAGINA = 8

export function CatalogoPage() {
  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [pagina, setPagina] = useState(1)
  const search = useDebounce(busqueda.trim())
  const agregar = useCartStore((s) => s.agregar)
  const [aviso, setAviso] = useState<string | null>(null)

  const { data: categorias } = useCategorias()
  const { data, isLoading, isError, error } = useProductos({
    skip: (pagina - 1) * POR_PAGINA,
    limit: POR_PAGINA,
    search: search || undefined,
    categoria_id: categoriaId ? Number(categoriaId) : undefined,
  })

  function alAgregar(p: Producto) {
    agregar({ producto_id: p.id, nombre: p.nombre, precio_unitario: p.precio_base, stock: p.stock })
    setAviso(`"${p.nombre}" se agregó al carrito`)
    setTimeout(() => setAviso(null), 2000)
  }

  const totalPaginas = data ? Math.ceil(data.total / POR_PAGINA) : 1

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Catálogo</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Buscar" placeholder="Nombre del producto…" value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPagina(1) }} />
        <Select label="Categoría" value={categoriaId} onChange={(e) => { setCategoriaId(e.target.value); setPagina(1) }}>
          <option value="">Todas</option>
          {categorias?.filter((c) => c.activo).map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </Select>
      </div>
      {aviso && <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{aviso}</p>}
      {isError && <EstadoError mensaje={handleApiError(error, 'No se pudo cargar el catálogo')} />}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: POR_PAGINA }, (_, i) => <SkeletonTarjeta key={i} />)}
        </div>
      ) : data && data.items.length === 0 ? (
        <EstadoVacio mensaje="No se encontraron productos con esos filtros." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data?.items.map((p) => <ProductoCard key={p.id} producto={p} onAgregar={alAgregar} />)}
        </div>
      )}
      {data && data.total > POR_PAGINA && <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />}
    </div>
  )
}
