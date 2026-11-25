export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} aria-hidden="true" />
}

// Esqueleto de una tarjeta de producto, mientras carga el catálogo
export function SkeletonTarjeta() {
  return (
    <div data-testid="skeleton" className="rounded-xl border border-gray-200 bg-surface p-4 shadow-sm">
      <Skeleton className="mb-3 h-36 w-full" />
      <Skeleton className="mb-2 h-4 w-3/4" />
      <Skeleton className="mb-4 h-3 w-1/2" />
      <Skeleton className="h-8 w-full" />
    </div>
  )
}

// Esqueleto de una tabla, mientras cargan los datos del panel
export function SkeletonTabla({ filas = 5 }: { filas?: number }) {
  return (
    <div data-testid="skeleton" className="space-y-2" aria-busy="true">
      {Array.from({ length: filas }, (_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}
