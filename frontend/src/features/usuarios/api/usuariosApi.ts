import { api } from '@/shared/api/axiosInstance'
import type { Usuario } from '@/features/auth/types/auth'

export const listarUsuarios = async (): Promise<Usuario[]> => (await api.get<Usuario[]>('/admin/usuarios')).data
export const activarUsuario = async (id: number): Promise<Usuario> => (await api.post<Usuario>(`/admin/usuarios/${id}/activar`)).data
export const desactivarUsuario = async (id: number): Promise<Usuario> =>
  (await api.post<Usuario>(`/admin/usuarios/${id}/desactivar`)).data
