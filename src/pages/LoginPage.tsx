import { useState, useId } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthInput from "../components/auth/AuthInput";
import AuthLayout from "../components/auth/AuthLayout";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const passwordId = useId();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 600);
  }

  function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    setForgotSubmitted(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSubmitted(false);
      setForgotEmail("");
    }, 2200);
  }

  return (
    <AuthLayout
      eyebrow="Bem-vindo de volta"
      title="Entrar na sua conta"
      description="Aceda aos seus favoritos, mensagens, agendamentos e imóveis guardados."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-ondjo-blue/30 bg-ondjo-blue-soft/60 p-4 text-sm text-ondjo-navy shadow-xs"
          >
            <CheckCircle2 className="size-5 shrink-0 text-ondjo-blue mt-0.5" />
            <div>
              <p className="font-bold text-ondjo-navy">Sessão simulada com sucesso!</p>
              <p className="mt-1 text-xs text-ondjo-muted">
                Interface pronta para conexão com o backend de autenticação.
              </p>
              <a href="#/" className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-ondjo-blue hover:underline">
                Ir para a página inicial <ArrowRight className="size-3.5" />
              </a>
            </div>
          </motion.div>
        )}

        <div className="space-y-4">
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
                htmlFor={passwordId}
                className="text-sm font-semibold text-ondjo-ink"
              >
                Palavra-passe
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="focus-ring rounded-lg text-xs font-bold text-ondjo-blue hover:text-ondjo-blue-dark transition-colors"
              >
                Esqueci-me da palavra-passe
              </button>
            </div>

            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ondjo-muted">
                <LockKeyhole className="size-4" />
              </span>
              <input
                id={passwordId}
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="A sua palavra-passe"
                className="focus-ring min-h-12 w-full rounded-xl border border-ondjo-border bg-white pl-10 pr-12 text-sm text-ondjo-ink placeholder:text-ondjo-muted/60 transition-shadow outline-none"
              />
              <button
                type="button"
                aria-label={showPassword ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
                onClick={() => setShowPassword((v) => !v)}
                className="focus-ring absolute right-2.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-ondjo-muted hover:bg-ondjo-bg hover:text-ondjo-ink transition-colors"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Lembrar-me */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="size-4 rounded border-ondjo-border text-ondjo-blue focus:ring-ondjo-blue"
            />
            <span className="text-sm font-medium text-ondjo-muted">Lembrar-me neste dispositivo</span>
          </label>
        </div>

        {/* Botão Entrar */}
        <button
          type="submit"
          disabled={isLoading}
          className="focus-ring flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-ondjo-blue px-5 text-sm font-bold text-white shadow-sm transition-all hover:bg-ondjo-blue-dark active:scale-[0.99] disabled:opacity-60"
        >
          {isLoading ? (
            <span className="inline-block size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              Entrar
              <ArrowRight className="size-4" />
            </>
          )}
        </button>

        {/* Rodapé de cadastro */}
        <div className="rounded-2xl border border-ondjo-border/80 bg-ondjo-bg/60 p-4 text-center">
          <p className="text-sm text-ondjo-muted">
            Ainda não tem uma conta?{" "}
            <a
              href="#/cadastro"
              className="font-bold text-ondjo-blue hover:text-ondjo-blue-dark hover:underline"
            >
              Criar conta gratuita
            </a>
          </p>
        </div>
      </form>

      {/* Modal de recuperação de palavra-passe */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ondjo-navy/50 backdrop-blur-xs"
              onClick={() => setShowForgotModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md rounded-2xl border border-ondjo-border bg-white p-6 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-ondjo-border">
                <h3 className="text-lg font-bold text-ondjo-navy">Recuperar palavra-passe</h3>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="rounded-lg p-1 text-ondjo-muted hover:bg-ondjo-bg hover:text-ondjo-ink"
                >
                  <X className="size-5" />
                </button>
              </div>

              {forgotSubmitted ? (
                <div className="py-6 text-center space-y-2">
                  <CheckCircle2 className="size-10 text-ondjo-success mx-auto" />
                  <p className="font-bold text-ondjo-navy">Instruções enviadas!</p>
                  <p className="text-xs text-ondjo-muted">
                    Se o email existir, receberá um link seguro para redefinir a palavra-passe.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="mt-4 space-y-4">
                  <p className="text-xs leading-relaxed text-ondjo-muted">
                    Introduza o email associado à sua conta ONDJO para receber as instruções de recuperação.
                  </p>
                  <AuthInput
                    id="forgot-email"
                    label="Email da conta"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="exemplo@email.com"
                    icon={<Mail className="size-4" />}
                  />
                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="px-4 py-2 rounded-xl border border-ondjo-border text-sm font-semibold text-ondjo-ink hover:bg-ondjo-bg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-ondjo-blue text-sm font-bold text-white hover:bg-ondjo-blue-dark"
                    >
                      Enviar link
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
