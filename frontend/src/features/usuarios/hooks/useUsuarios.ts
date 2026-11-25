import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { activarUsuario, desactivarUsuario, listarUsuarios } from '../api/usuariosApi'

export function useUsuarios() {
  return useQuery({ queryKey: ['usuarios'], queryFn: listarUsuarios })
}

export function useCambiarActivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activar }: { id: number; activar: boolean }) => (activar ? activarUsuario(id) : desactivarUsuario(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }),
  })
}
