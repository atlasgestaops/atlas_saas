'use client'

import { useActionState } from 'react'
import { login } from './actions'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      return await login(formData)
    },
    null
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] text-white">
      <div className="w-full max-w-sm p-8 bg-[#111113] rounded-2xl border border-white/5 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-indigo-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold font-outfit">AtlasOps</h1>
          <p className="text-sm text-gray-400 mt-1">Faça login na Torre de Controle</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1" htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
              placeholder="seu@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1" htmlFor="password">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#111113] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
