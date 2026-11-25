import { api } from '@/shared/api/axiosInstance'
import type { FiltrosProductos, Producto, ProductosPaginados, StockForm } from '../types/producto'

export interface ProductoPayload {
  categoria_id?: number
  nombre?: string
  descripcion?: string | null
  precio_base?: number
  imagen_url?: string | null
  stock?: number
  disponible?: boolean
}

export const listarProductos = async (filtros: FiltrosProductos): Promise<ProductosPaginados> =>
  (await api.get<ProductosPaginados>('/productos', { params: filtros })).data
export const crearProducto = async (p: ProductoPayload): Promise<Producto> => (await api.post<Producto>('/productos', p)).data
export const actualizarProducto = async (id: number, p: ProductoPayload): Promise<Producto> =>
  (await api.put<Producto>(`/productos/${id}`, p)).data
export const actualizarStock = async (id: number, p: StockForm): Promise<Producto> =>
  (await api.patch<Producto>(`/productos/${id}/stock`, p)).data
export const eliminarProducto = async (id: number): Promise<void> => {
  await api.delete(`/productos/${id}`)
}
