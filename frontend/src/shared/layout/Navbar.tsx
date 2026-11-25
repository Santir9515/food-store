import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { useThemeStore } from '@/store/themeStore'
import { Button } from '@/shared/ui/Button'

const claseLink = ({ isActive }: { isActive: boolean }) =>
  `rounded px-2 py-1 text-sm font-medium ${isActive ? 'bg-brand-100 text-brand-800' : 'text-gray-600 hover:text-gray-900'}`

export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const cantidad = useCartStore((s) => s.items.reduce((acc, i) => acc + i.cantidad, 0))
  const tema = useThemeStore((s) => s.tema)
  const alternarTema = useThemeStore((s) => s.alternar)
  const navigate = useNavigate()

  async function salir() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="border-b border-gray-200 bg-surface">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <Link to="/" className="mr-4 text-lg font-extrabold text-brand-600">
          🍔 Food Store
        </Link>
        <NavLink to="/" end className={claseLink}>Catálogo</NavLink>
        <NavLink to="/carrito" className={claseLink}>
          Carrito{cantidad > 0 && <span className="ml-1 rounded-full bg-brand-600 px-1.5 text-xs text-white">{cantidad}</span>}
        </NavLink>
        {usuario?.role === 'user' && <NavLink to="/mis-pedidos" className={claseLink}>Mis pedidos</NavLink>}
        {usuario?.role === 'admin' && (
          <>
            <NavLink to="/admin/resumen" className={claseLink}>Resumen</NavLink>
            <NavLink to="/admin/pedidos" className={claseLink}>Pedidos</NavLink>
            <NavLink to="/admin/productos" className={claseLink}>Productos</NavLink>
            <NavLink to="/admin/categorias" className={claseLink}>Categorías</NavLink>
            <NavLink to="/admin/usuarios" className={claseLink}>Usuarios</NavLink>
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={alternarTema} aria-label="Cambiar tema">
            {tema === 'claro' ? '🌙 Oscuro' : '☀️ Claro'}
          </Button>
          {usuario ? (
            <>
              <span className="text-sm text-gray-600">
                {usuario.full_name} {usuario.role === 'admin' && <b className="text-brand-700">(admin)</b>}
              </span>
              <Button variant="secondary" size="sm" onClick={salir}>Cerrar sesión</Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">Ingresar</Link>
              <Link to="/register" className="rounded-lg bg-brand-600 px-3 py-1 text-sm font-semibold text-white hover:bg-brand-700">Registrarme</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
