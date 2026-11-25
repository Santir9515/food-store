import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Tema = 'claro' | 'oscuro'

interface ThemeState {
  tema: Tema
  alternar: () => void
}

// Sin preferencia guardada se usa la del sistema operativo
function temaInicial(): Tema {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro'
}

function aplicar(tema: Tema): void {
  document.documentElement.classList.toggle('dark', tema === 'oscuro')
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      tema: temaInicial(),
      alternar: () => {
        const siguiente: Tema = get().tema === 'claro' ? 'oscuro' : 'claro'
        aplicar(siguiente)
        set({ tema: siguiente })
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (estado) => {
        if (estado) aplicar(estado.tema)
      },
    },
  ),
)

// Aplica el tema al cargar (cuando no hay nada guardado, el valor inicial viene del sistema)
aplicar(useThemeStore.getState().tema)
