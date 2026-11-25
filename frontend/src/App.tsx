import { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/shared/api/queryClient'
import { AppRouter } from '@/routes/AppRouter'
import { useAuthStore } from '@/store/authStore'
import '@/store/themeStore' // aplica el tema guardado apenas carga la app

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession)

  // Único efecto de carga de datos con fetch directo: verifica la sesión al arrancar
  useEffect(() => {
    void checkSession()
  }, [checkSession])

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  )
}
