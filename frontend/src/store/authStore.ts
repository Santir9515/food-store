import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { loginRequest, logoutRequest, meRequest } from '@/features/auth/api/authApi'
import type { Usuario } from '@/features/auth/types/auth'
import { registrarAlPerderSesion } from '@/shared/api/axiosInstance'
import { queryClient } from '@/shared/api/queryClient'

interface AuthState {
  usuario: Usuario | null
  cargando: boolean // true hasta verificar la sesión con el backend
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiarSesion: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,
      login: async (username, password) => {
        await loginRequest(username, password)
        const usuario = await meRequest()
        set({ usuario })
      },
      logout: async () => {
        try {
          await logoutRequest()
        } finally {
          set({ usuario: null })
          queryClient.clear()
        }
      },
      // Pregunta al backend si la cookie sigue siendo válida
      checkSession: async () => {
        try {
          const usuario = await meRequest()
          set({ usuario, cargando: false })
        } catch {
          set({ usuario: null, cargando: false })
        }
      },
      limpiarSesion: () => {
        set({ usuario: null })
        queryClient.clear()
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ usuario: state.usuario }), // solo el usuario; nunca el token
    },
  ),
)

// El interceptor de Axios llama a esto cuando la API responde 401 o cuenta desactivada
registrarAlPerderSesion(() => useAuthStore.getState().limpiarSesion())
