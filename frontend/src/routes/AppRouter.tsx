import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MainLayout } from '@/shared/layout/MainLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { UnauthorizedPage } from '@/features/auth/pages/UnauthorizedPage'
import { CatalogoPage } from '@/features/productos/pages/CatalogoPage'
import { CarritoPage } from '@/features/pedidos/pages/CarritoPage'
import { CheckoutPage } from '@/features/pedidos/pages/CheckoutPage'
import { MisPedidosPage } from '@/features/pedidos/pages/MisPedidosPage'
import { AdminResumenPage } from '@/features/pedidos/pages/AdminResumenPage'
import { AdminPedidosPage } from '@/features/pedidos/pages/AdminPedidosPage'
import { AdminProductosPage } from '@/features/productos/pages/AdminProductosPage'
import { AdminCategoriasPage } from '@/features/categorias/pages/AdminCategoriasPage'
import { AdminUsuariosPage } from '@/features/usuarios/pages/AdminUsuariosPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Públicas */}
          <Route path="/" element={<CatalogoPage />} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Requieren sesión */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            <Route path="/mis-pedidos" element={<MisPedidosPage />} />
          </Route>

          {/* Solo administrador */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/resumen" element={<AdminResumenPage />} />
            <Route path="/admin/pedidos" element={<AdminPedidosPage />} />
            <Route path="/admin/productos" element={<AdminProductosPage />} />
            <Route path="/admin/categorias" element={<AdminCategoriasPage />} />
            <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
          </Route>

          <Route path="*" element={<UnauthorizedPage noEncontrada />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
