import { api } from '@/shared/api/axiosInstance'
import type { DatosRegistro, Usuario } from '../types/auth'

export async function loginRequest(username: string, password: string): Promise<void> {
  // /auth/token usa OAuth2PasswordRequestForm: cuerpo form-urlencoded
  const cuerpo = new URLSearchParams({ username, password })
  await api.post('/auth/token', cuerpo)
}

export async function registrarRequest(datos: DatosRegistro): Promise<Usuario> {
  const { data } = await api.post<Usuario>('/auth/register', datos)
  return data
}

export async function meRequest(): Promise<Usuario> {
  const { data } = await api.get<Usuario>('/auth/me')
  return data
}

export async function logoutRequest(): Promise<void> {
  await api.post('/auth/logout')
}
