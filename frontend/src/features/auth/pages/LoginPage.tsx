import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { useAuthStore } from '@/store/authStore'
import { handleApiError } from '@/shared/api/handleApiError'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Input, errorDeCampo } from '@/shared/ui/Input'
import { EstadoError } from '@/shared/components/EstadoError'

export function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const usuario = useAuthStore((s) => s.usuario)
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await login(value.username, value.password)
        const actual = useAuthStore.getState().usuario
        navigate(actual?.role === 'admin' ? '/admin/resumen' : '/')
      } catch (e) {
        setError(handleApiError(e, 'No se pudo iniciar sesión'))
      }
    },
  })

  if (usuario) return <Navigate to="/" replace />

  return (
    <Card className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-xl font-bold">Iniciar sesión</h1>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <form.Field name="username" validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'Ingresá tu usuario') }}>
          {(field) => (
            <Input label="Usuario" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} error={errorDeCampo(field)} autoComplete="username" />
          )}
        </form.Field>
        <form.Field name="password" validators={{ onChange: ({ value }) => (value ? undefined : 'Ingresá tu contraseña') }}>
          {(field) => (
            <Input label="Contraseña" type="password" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} error={errorDeCampo(field)} autoComplete="current-password" />
          )}
        </form.Field>
        {error && <EstadoError mensaje={error} />}
        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(enviando) => (
            <Button type="submit" className="w-full" disabled={enviando}>
              {enviando ? 'Ingresando…' : 'Ingresar'}
            </Button>
          )}
        </form.Subscribe>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        ¿No tenés cuenta? <Link to="/register" className="font-semibold text-brand-700 hover:underline">Registrate</Link>
      </p>
    </Card>
  )
}
