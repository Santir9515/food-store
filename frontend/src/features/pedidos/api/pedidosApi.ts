import { api } from '@/shared/api/axiosInstance'
import type { EstadoPedido, Pedido, PedidoCrear, PedidosPaginados, ResumenPedidos } from '../types/pedido'

export interface FiltrosPedidos {
  skip: number
  limit: number
  estado?: EstadoPedido
}

export const crearPedido = async (p: PedidoCrear): Promise<Pedido> => (await api.post<Pedido>('/pedidos', p)).data
export const listarPedidos = async (f: FiltrosPedidos): Promise<PedidosPaginados> =>
  (await api.get<PedidosPaginados>('/pedidos', { params: f })).data
export const resumenPedidos = async (): Promise<ResumenPedidos> => (await api.get<ResumenPedidos>('/pedidos/resumen')).data
export const cambiarEstado = async (id: number, estado: EstadoPedido): Promise<Pedido> =>
  (await api.patch<Pedido>(`/pedidos/${id}/estado`, { estado })).data
export const cancelarPedido = async (id: number): Promise<Pedido> => (await api.patch<Pedido>(`/pedidos/${id}/cancelar`)).data
