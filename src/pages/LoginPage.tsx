import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import AuthInput from "../components/auth/AuthInput";
import AuthLayout from "../components/auth/AuthLayout";
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }
  return (
    <AuthLayout
      eyebrow="Bem-vindo de volta"
      title="Entrar na sua conta"
      description="Aceda aos seus favoritos, mensagens, agendamentos e imóveis guardados."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {submitted ? (
          <div
            role="status"
            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          >
            Interface pronta. Ligue este formulário ao seu sistema de
            autenticação no backend.
          </div>
        ) : null}
        <AuthInput
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          label="Email"
          placeholder="exemplo@email.com"
          icon={<Mail className="size-4" />}
        />
        <div>
          <div className="mb-2 flex items-center justify-between gap-4">
            <label
              htmlFor="login-password"
              className="text-sm font-semibold text-slate-800"
            >
              Palavra-passe
            </label>
            <button
              type="button"
              className="focus-ring rounded-md text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Esqueci-me da palavra-passe
            </button>
          </div>
          <span className="relative block">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="A sua palavra-passe"
              className="focus-ring min-h-12 w-full rounded-xl border border-slate-200 bg-white px-10 pr-12 text-sm outline-none placeholder:text-slate-400"
            />
            <button
              type="button"
              aria-label={
                showPassword ? "Ocultar palavra-passe" : "Mostrar palavra-passe"
              }
              onClick={() => setShowPassword((v) => !v)}
              className="focus-ring absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </span>
        </div>
        <button
          type="submit"
          className="focus-ring min-h-12 w-full rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-[0.99]"
        >
          Entrar
        </button>
        <p className="text-center text-sm text-slate-500">
          Ainda não tem uma conta?{" "}
          <a
            href="#/cadastro"
            className="font-bold text-blue-600 hover:text-blue-700"
          >
            Criar conta
          </a>
        </p>
      </form>
    </AuthLayout>
  );
}
