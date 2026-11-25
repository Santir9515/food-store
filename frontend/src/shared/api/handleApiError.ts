import axios from 'axios'

interface ErrorValidacion {
  loc?: (string | number)[]
  msg?: string
}

interface CuerpoError {
  detail?: string | ErrorValidacion[]
}

// Convierte el `detail` de la API en un mensaje para mostrar en pantalla
export function handleApiError(error: unknown, mensajeBase = 'Ocurrió un error inesperado'): string {
  if (!axios.isAxiosError<CuerpoError>(error)) return mensajeBase
  if (!error.response) return 'No se pudo conectar con el servidor'
  const detail = error.response.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((d) => d.msg ?? '').filter(Boolean).join(', ') || mensajeBase
  }
  return mensajeBase
}
