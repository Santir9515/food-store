// Formato de moneda (pesos argentinos) y de fecha para mostrar en pantalla
const MONEDA = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })
const FECHA = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' })

export function formatearPrecio(valor: number): string {
  return MONEDA.format(valor)
}

// La API guarda las fechas en UTC sin zona: se interpretan como UTC
export function formatearFecha(iso: string): string {
  const conZona = /[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`
  return FECHA.format(new Date(conZona))
}
