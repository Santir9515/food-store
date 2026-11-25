import { Link } from 'react-router-dom'
import { EstadoVacio } from '@/shared/components/EstadoVacio'

export function UnauthorizedPage({ noEncontrada = false }: { noEncontrada?: boolean }) {
  return (
    <EstadoVacio mensaje={noEncontrada ? 'La página que buscás no existe.' : 'No tenés permisos para ver esta página.'}>
      <Link to="/" className="font-semibold text-brand-700 hover:underline">Volver al catálogo</Link>
    </EstadoVacio>
  )
}
