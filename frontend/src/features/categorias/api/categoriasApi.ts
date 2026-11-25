import { api } from '@/shared/api/axiosInstance'
import type { Categoria } from '../types/categoria'

export interface CategoriaPayload {
  nombre?: string
  descripcion?: string | null
}

export const listarCategorias = async (): Promise<Categoria[]> => (await api.get<Categoria[]>('/categorias')).data
export const crearCategoria = async (p: CategoriaPayload): Promise<Categoria> => (await api.post<Categoria>('/categorias', p)).data
export const actualizarCategoria = async (id: number, p: CategoriaPayload): Promise<Categoria> =>
  (await api.put<Categoria>(`/categorias/${id}`, p)).data
export const eliminarCategoria = async (id: number): Promise<void> => {
  await api.delete(`/categorias/${id}`)
}
