import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ItemCarrito {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
  stock: number
}

interface CartState {
  items: ItemCarrito[]
  agregar: (item: Omit<ItemCarrito, 'cantidad'>) => void
  quitar: (productoId: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
  cantidadTotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      agregar: (nuevo) =>
        set((s) => {
          const existente = s.items.find((i) => i.producto_id === nuevo.producto_id)
          if (!existente) return { items: [...s.items, { ...nuevo, cantidad: 1 }] }
          return {
            items: s.items.map((i) =>
              i.producto_id === nuevo.producto_id
                ? { ...i, stock: nuevo.stock, cantidad: Math.min(i.cantidad + 1, Math.max(nuevo.stock, 1)) }
                : i,
            ),
          }
        }),
      quitar: (id) => set((s) => ({ items: s.items.filter((i) => i.producto_id !== id) })),
      cambiarCantidad: (id, cantidad) =>
        set((s) => ({
          items:
            cantidad < 1
              ? s.items.filter((i) => i.producto_id !== id)
              : s.items.map((i) => (i.producto_id === id ? { ...i, cantidad: Math.min(cantidad, Math.max(i.stock, 1)) } : i)),
        })),
      vaciar: () => set({ items: [] }),
      total: () => get().items.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0),
      cantidadTotal: () => get().items.reduce((acc, i) => acc + i.cantidad, 0),
    }),
    { name: 'cart-storage' },
  ),
)
