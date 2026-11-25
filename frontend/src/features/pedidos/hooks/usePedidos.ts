import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { cambiarEstado, cancelarPedido, crearPedido, listarPedidos, resumenPedidos, type FiltrosPedidos } from '../api/pedidosApi'
import type { EstadoPedido, PedidoCrear } from '../types/pedido'

// Un pedido toca el stock de los productos y el resumen del panel: se refrescan juntos
function invalidarTodo(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: ['pedidos'] })
  qc.invalidateQueries({ queryKey: ['productos'] })
  qc.invalidateQueries({ queryKey: ['resumen'] })
}

export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: ['pedidos', filtros],
    queryFn: () => listarPedidos(filtros),
    placeholderData: keepPreviousData,
  })
}

export function useResumenPedidos() {
  return useQuery({ queryKey: ['resumen'], queryFn: resumenPedidos })
}

export function useCrearPedido() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (p: PedidoCrear) => crearPedido(p), onSuccess: () => invalidarTodo(qc) })
}

export function useCambiarEstadoPedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstado(id, estado),
    onSuccess: () => invalidarTodo(qc),
  })
}

export function useCancelarPedido() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (id: number) => cancelarPedido(id), onSuccess: () => invalidarTodo(qc) })
}
