import { useEffect, useId, useRef, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { m } from "framer-motion";
import AuthInput from "../components/auth/AuthInput";
import AuthLayout from "../components/auth/AuthLayout";
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Separator,
} from "../components/ui";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const passwordId = useId();
  const rememberId = useId();
  const loginTimerRef = useRef<number | null>(null);
  const forgotTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (loginTimerRef.current !== null) window.clearTimeout(loginTimerRef.current);
      if (forgotTimerRef.current !== null) window.clearTimeout(forgotTimerRef.current);
    };
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    if (loginTimerRef.current !== null) window.clearTimeout(loginTimerRef.current);
    loginTimerRef.current = window.setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 250);
  }

  function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    setForgotSubmitted(true);
    if (forgotTimerRef.current !== null) window.clearTimeout(forgotTimerRef.current);
    forgotTimerRef.current = window.setTimeout(() => {
      setShowForgotModal(false);
      setForgotSubmitted(false);
      setForgotEmail("");
    }, 1500);
  }

  return (
    <AuthLayout
      eyebrow="Bem-vindo de volta"
      title="Entrar na sua conta"
      description="Aceda aos seus favoritos, mensagens, agendamentos e imóveis guardados."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {submitted && (
          <m.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            role="status"
            className="ondjo-border-featured flex items-start gap-3 rounded-2xl bg-ondjo-blue-soft/60 p-4 text-sm text-ondjo-navy shadow-xs"
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
          </m.div>
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
                onClick={() => {
                  setForgotSubmitted(false);
                  setShowForgotModal(true);
                }}
                className="focus-ring rounded-lg text-xs font-bold text-ondjo-blue hover:text-ondjo-blue-dark transition-colors cursor-pointer"
              >
                Esqueci-me da palavra-passe
              </button>
            </div>

            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ondjo-muted">
                <LockKeyhole className="size-4" />
              </span>
              <Input
                id={passwordId}
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="A sua palavra-passe"
                className="h-12 rounded-xl ondjo-border-interactive bg-white pl-10 pr-12 text-sm text-ondjo-ink placeholder:text-slate-400"
              />
              <button
                type="button"
                aria-label={showPassword ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
                onClick={() => setShowPassword((v) => !v)}
                className="focus-ring absolute right-2.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-ondjo-muted hover:bg-ondjo-bg hover:text-ondjo-ink transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Lembrar-me (shadcn Checkbox) */}
        <div className="flex items-center justify-between pt-1">
          <label
            htmlFor={rememberId}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <Checkbox
              id={rememberId}
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
            />
            <span className="text-sm font-medium text-ondjo-muted">
              Lembrar-me neste dispositivo
            </span>
          </label>
        </div>

        {/* Botão Entrar (shadcn Button) */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
          rightIcon={!isLoading ? <ArrowRight className="size-4" /> : undefined}
          className="min-h-12 rounded-xl text-sm font-bold shadow-sm"
        >
          Entrar
        </Button>

        {/* Rodapé de cadastro */}
        <div className="ondjo-border-surface rounded-2xl bg-ondjo-bg/60 p-4 text-center">
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

      {/* Modal de recuperação de palavra-passe (shadcn Dialog) */}
      <Dialog open={showForgotModal} onOpenChange={setShowForgotModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-ondjo-navy">
              Recuperar palavra-passe
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-ondjo-muted">
              Introduza o email associado à sua conta ONDJO para receber as instruções de recuperação.
            </DialogDescription>
          </DialogHeader>

          <Separator className="bg-ondjo-border-hairline" />

          {forgotSubmitted ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle2 className="size-10 text-ondjo-success mx-auto" />
              <p className="font-bold text-ondjo-navy">Instruções enviadas!</p>
              <p className="text-xs text-ondjo-muted">
                Se o email existir, receberá um link seguro para redefinir a palavra-passe.
              </p>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
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
              <DialogFooter className="mx-0 mb-0 rounded-none border-t border-ondjo-border-hairline bg-transparent px-0 pt-3 pb-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForgotModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Enviar link
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AuthLayout>
  );
}
