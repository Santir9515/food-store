import type { AnyFieldApi } from '@tanstack/react-form'
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const CLASE_CAMPO =
  'mt-1 w-full rounded-lg border border-gray-300 bg-surface px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'

interface BaseProps {
  label: string
  error?: string
}

function Etiqueta({ label, error, children }: BaseProps & { children: ReactNode }) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {children}
      {error && <span className="mt-1 block text-xs font-normal text-red-600">{error}</span>}
    </label>
  )
}

export function Input({ label, error, ...props }: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Etiqueta label={label} error={error}>
      <input className={CLASE_CAMPO} {...props} />
    </Etiqueta>
  )
}

export function Select({ label, error, children, ...props }: BaseProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Etiqueta label={label} error={error}>
      <select className={CLASE_CAMPO} {...props}>
        {children}
      </select>
    </Etiqueta>
  )
}

export function Textarea({ label, error, ...props }: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Etiqueta label={label} error={error}>
      <textarea rows={3} className={CLASE_CAMPO} {...props} />
    </Etiqueta>
  )
}

// Errores de un campo de TanStack Form, listos para mostrar (solo después de tocarlo)
export function errorDeCampo(field: AnyFieldApi): string | undefined {
  if (!field.state.meta.isTouched && field.form.state.submissionAttempts === 0) return undefined
  const errores = field.state.meta.errors.filter(Boolean).map(String)
  return errores.length > 0 ? errores.join(', ') : undefined
}
