import { useEffect, useState } from 'react'

// Devuelve `valor` con retraso: evita pedir al servidor en cada tecla
export function useDebounce<T>(valor: T, retrasoMs = 350): T {
  const [retrasado, setRetrasado] = useState(valor)
  useEffect(() => {
    const temporizador = setTimeout(() => setRetrasado(valor), retrasoMs)
    return () => clearTimeout(temporizador)
  }, [valor, retrasoMs])
  return retrasado
}
