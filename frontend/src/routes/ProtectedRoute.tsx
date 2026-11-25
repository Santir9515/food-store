import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { Rol } from '@/features/auth/types/auth'

interface ProtectedRouteProps {
  allowedRoles?: Rol[]
}

// Sin sesión → /login. Con sesión pero sin el rol requerido → /unauthorized.
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)

  if (cargando) return <p className="p-6 text-gray-500">Verificando sesión…</p>
  if (!usuario) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(usuario.role as Rol)) return <Navigate to="/unauthorized" replace />
  return <Outlet />
}
