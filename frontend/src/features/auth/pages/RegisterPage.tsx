import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { registrarRequest } from '../api/authApi'
import { useAuthStore } from '@/store/authStore'
import { handleApiError } from '@/shared/api/handleApiError'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Input, errorDeCampo } from '@/shared/ui/Input'
import { EstadoError } from '@/shared/components/EstadoError'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RegisterPage() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await registrarRequest(value)
        await login(value.username, value.password) // queda con sesión iniciada
        navigate('/')
      } catch (e) {
        setError(handleApiError(e, 'No se pudo completar el registro'))
      }
    },
  })

  return (
    <Card className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-xl font-bold">Crear cuenta</h1>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <form.Field name="username" validators={{ onChange: ({ value }) => (value.length >= 3 ? undefined : 'Mínimo 3 caracteres') }}>
          {(field) => <Input label="Usuario" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} error={errorDeCampo(field)} />}
        </form.Field>
        <form.Field name="full_name" validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'Ingresá tu nombre completo') }}>
          {(field) => <Input label="Nombre completo" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} error={errorDeCampo(field)} />}
        </form.Field>
        <form.Field name="email" validators={{ onChange: ({ value }) => (EMAIL.test(value) ? undefined : 'Email inválido') }}>
          {(field) => <Input label="Email" type="email" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} error={errorDeCampo(field)} />}
        </form.Field>
        <form.Field name="password" validators={{ onChange: ({ value }) => (value.length >= 8 ? undefined : 'Mínimo 8 caracteres') }}>
          {(field) => <Input label="Contraseña" type="password" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} error={errorDeCampo(field)} />}
        </form.Field>
        {error && <EstadoError mensaje={error} />}
        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(enviando) => (
            <Button type="submit" className="w-full" disabled={enviando}>
              {enviando ? 'Creando…' : 'Registrarme'}
            </Button>
          )}
        </form.Subscribe>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        ¿Ya tenés cuenta? <Link to="/login" className="font-semibold text-brand-700 hover:underline">Ingresá</Link>
      </p>
    </Card>
  )
}
