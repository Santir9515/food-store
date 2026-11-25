import type { ReactNode } from 'react'

interface EstadoVacioProps {
  mensaje: string
  children?: ReactNode
}

export function EstadoVacio({ mensaje, children }: EstadoVacioProps) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-surface px-6 py-10 text-center text-gray-500">
      <p>{mensaje}</p>
      {children && <div className="mt-3">{children}</div>}
    </div>
  )
}
