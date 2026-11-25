import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // el navegador envía la cookie HttpOnly en cada petición
})

// El token viaja en la cookie HttpOnly: JavaScript no la lee ni la guarda, por eso no hay interceptor de solicitud.

// El store de sesión registra acá qué hacer cuando la sesión deja de ser válida
// (así este archivo no depende del store y se evita un import circular).
let alPerderSesion: (() => void) | null = null

export function registrarAlPerderSesion(callback: () => void): void {
  alPerderSesion = callback
}

interface DetalleError {
  detail?: unknown
}

// Interceptor de respuesta:
//  - 401 fuera de /auth/token y /auth/me: sesión vencida o inválida
//  - 400 «Cuenta de usuario desactivada»: la cuenta fue dada de baja con la sesión abierta
// En ambos casos se limpia el authStore y ProtectedRoute lleva a /login.
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error: unknown) => {
    if (axios.isAxiosError<DetalleError>(error) && error.response) {
      const url = error.config?.url ?? ''
      const esLoginOMe = url.includes('/auth/token') || url.includes('/auth/me')
      const { status, data } = error.response
      const desactivada = status === 400 && data?.detail === 'Cuenta de usuario desactivada'
      if ((status === 401 && !esLoginOMe) || (desactivada && !url.includes('/auth/token'))) {
        alPerderSesion?.()
      }
    }
    return Promise.reject(error)
  },
)
