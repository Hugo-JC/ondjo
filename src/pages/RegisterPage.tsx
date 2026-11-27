import { useId, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Building2,
  Check,
  Eye,
  EyeOff,
  Home,
  LockKeyhole,
  Mail,
  UserRound,
  Phone,
} from "lucide-react";
import { m } from "framer-motion";
import AuthInput from "../components/auth/AuthInput";
import AuthLayout from "../components/auth/AuthLayout";
import RoleCard from "../components/auth/RoleCard";
import {
  Button,
  Checkbox,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui";

type Role = "cliente" | "proprietario";
type Step = 1 | 2 | 3 | 4;

const CLIENT_GOALS = [
  { value: "Quero arrendar", label: "Quero arrendar apartamento/casa" },
  { value: "Quero comprar", label: "Quero comprar imóvel definitivo" },
  { value: "Ainda não decidi", label: "Ainda estou a explorar opções" },
] as const;

const OWNER_GOALS = [
  { value: "Arrendamento", label: "Apenas arrendamento" },
  { value: "Venda", label: "Apenas venda" },
  { value: "Venda e arrendamento", label: "Venda e arrendamento" },
] as const;

export default function RegisterPage() {
  const [step, setStep] = useState<Step>(1);
  const [role, setRole] = useState<Role>("cliente");
  const [showPassword, setShowPassword] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Campos do formulário
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [goal, setGoal] = useState("Quero arrendar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const termsId = useId();
  const progress = useMemo(() => `${step * 25}%`, [step]);

  const goalOptions = role === "cliente" ? CLIENT_GOALS : OWNER_GOALS;
  const selectedGoalLabel =
    goalOptions.find((g) => g.value === goal)?.label ?? goalOptions[0].label;

  function handleSelectRole(nextRole: Role) {
    setRole(nextRole);
    setGoal(
      nextRole === "cliente" ? CLIENT_GOALS[0].value : OWNER_GOALS[0].value,
    );
  }

  // Medidor de força de senha
  const passwordStrength = useMemo(() => {
    if (!password) return { level: 0, label: "Não inserida", color: "bg-ondjo-border" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: "Fraca", color: "bg-ondjo-danger" };
    if (score <= 3) return { level: 2, label: "Média", color: "bg-ondjo-warning" };
    return { level: 3, label: "Forte", color: "bg-ondjo-success" };
  }, [password]);

  function validateStep(s: Step): boolean {
    setErrorMsg(null);
    if (s === 2) {
      if (!firstName.trim() || !lastName.trim()) {
        setErrorMsg("Por favor, preencha o seu nome e apelido.");
        return false;
      }
      if (!phone.trim()) {
        setErrorMsg("Por favor, introduza um número de telefone válido.");
        return false;
      }
    }
    if (s === 3) {
      if (!email.trim() || !email.includes("@")) {
        setErrorMsg("Por favor, introduza um email válido.");
        return false;
      }
      if (password.length < 8) {
        setErrorMsg("A palavra-passe deve ter pelo menos 8 caracteres.");
        return false;
      }
      if (password !== passwordConfirm) {
        setErrorMsg("As palavras-passe não coincidem.");
        return false;
      }
    }
    return true;
  }

  const next = () => {
    if (validateStep(step)) {
      setStep((v) => (v < 4 ? ((v + 1) as Step) : v));
    }
  };

  const previous = () => {
    setErrorMsg(null);
    setStep((v) => (v > 1 ? ((v - 1) as Step) : v));
  };

  if (completed) {
    return (
      <AuthLayout
        eyebrow="Conta preparada"
        title="Tudo pronto para começar!"
        description="O seu registo no ONDJO foi simulado com sucesso."
      >
        <m.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-ondjo-green/30 bg-ondjo-green-soft/60 p-6 sm:p-8"
        >
          <div className="grid size-14 place-items-center rounded-2xl bg-ondjo-green text-white shadow-sm">
            <Check className="size-7 stroke-[2.5]" />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-ondjo-navy">
            Bem-vindo ao ONDJO, {firstName || "Utilizador"}!
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ondjo-ink">
            A sua conta de <strong>{role === "cliente" ? "Cliente" : "Proprietário"}</strong> está configurada.
            A plataforma está preparada para conectar o seu fluxo ao serviço de autenticação do backend.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#/"
              className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-ondjo-blue px-6 text-sm font-bold text-white shadow-sm hover:bg-ondjo-blue-dark transition-colors"
            >
              Explorar a página inicial
              <ArrowRight className="size-4" />
            </a>
            <a
              href="#/pesquisar"
              className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl ondjo-border-interactive bg-white px-5 text-sm font-bold text-ondjo-ink hover:bg-ondjo-bg transition-colors"
            >
              Pesquisar imóveis
            </a>
          </div>
        </m.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow={`Criar conta · Passo ${step} de 4`}
      title={
        step === 1
          ? "Como pretende usar a ONDJO?"
          : step === 2
            ? "Vamos conhecer um pouco de si."
            : step === 3
              ? "Crie os dados da sua conta."
              : "Confirme e termine o cadastro."
      }
      description={
        step === 1
          ? "Escolha o perfil que melhor representa o que pretende fazer na plataforma."
          : step === 2
            ? "Estas informações ajudam a personalizar a sua experiência no mercado angolano."
            : step === 3
              ? "Use um email que consiga consultar e uma palavra-passe segura."
              : "Reveja o seu perfil e dados antes de concluir."
      }
    >
      {/* Barra de Progresso Aprimorada */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs font-bold text-ondjo-muted">
          <span>Passo {step} de 4</span>
          <span>{progress}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-ondjo-border">
          <m.div
            className="h-full rounded-full bg-ondjo-blue"
            animate={{ width: progress }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          />
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          {[
            { num: 1, label: "Perfil" },
            { num: 2, label: "Dados" },
            { num: 3, label: "Conta" },
            { num: 4, label: "Finalizar" },
          ].map((item) => (
            <div
              key={item.num}
              className={[
                "text-xs font-bold transition-colors",
                item.num <= step ? "text-ondjo-blue" : "text-ondjo-muted/60",
              ].join(" ")}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Alerta de erro de validação */}
      {errorMsg && (
        <m.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-2 rounded-xl border border-ondjo-danger/20 bg-red-50 p-3.5 text-xs font-semibold text-ondjo-danger"
          role="alert"
        >
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMsg}</span>
        </m.div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (validateStep(step) && termsAccepted) {
            setCompleted(true);
          }
        }}
      >
        {step === 1 && (
          <m.div
            key="step-1"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <RoleCard
              title="Quero encontrar um imóvel"
              description="Pesquisar, guardar favoritos, conversar e agendar visitas em Angola."
              icon={<Home className="size-5" />}
              selected={role === "cliente"}
              onClick={() => handleSelectRole("cliente")}
            />
            <RoleCard
              title="Quero anunciar um imóvel"
              description="Publicar imóveis, gerir anúncios e acompanhar interessados com segurança."
              icon={<Building2 className="size-5" />}
              selected={role === "proprietario"}
              onClick={() => handleSelectRole("proprietario")}
            />
          </m.div>
        )}

        {step === 2 && (
          <m.div
            key="step-2"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <AuthInput
                id="register-first-name"
                label="Primeiro nome"
                placeholder="Ex: Hugo"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                required
                icon={<UserRound className="size-4" />}
              />
              <AuthInput
                id="register-last-name"
                label="Apelido"
                placeholder="Ex: Capolo"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                required
              />
            </div>

            <AuthInput
              id="register-phone"
              label="Telefone em Angola"
              type="tel"
              placeholder="+244 9xx xxx xxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              required
              icon={<Phone className="size-4" />}
              hint="Será usado para contactos relacionados com os imóveis e verificação da conta."
            />

            <div>
              <label
                htmlFor="register-goal"
                className="mb-2 block text-sm font-semibold text-ondjo-ink"
              >
                {role === "cliente" ? "O que procura principalmente?" : "O que pretende anunciar?"}
              </label>
              <Select
                value={goal}
                onValueChange={(val) => setGoal(String(val ?? goalOptions[0].value))}
              >
                <SelectTrigger
                  id="register-goal"
                  className="ondjo-border-interactive h-12 w-full rounded-xl bg-white px-4 text-sm font-medium text-ondjo-ink"
                >
                  <SelectValue>{selectedGoalLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent align="start">
                  {goalOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </m.div>
        )}

        {step === 3 && (
          <m.div
            key="step-3"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="space-y-4"
          >
            <AuthInput
              id="register-email"
              name="email"
              type="email"
              label="Email principal"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              icon={<Mail className="size-4" />}
            />

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="register-password"
                  className="text-sm font-semibold text-ondjo-ink"
                >
                  Palavra-passe
                </label>
                {password && (
                  <span className="text-xs font-bold text-ondjo-muted">
                    Força: <strong className={passwordStrength.level === 3 ? "text-ondjo-success" : passwordStrength.level === 2 ? "text-ondjo-warning" : "text-ondjo-danger"}>{passwordStrength.label}</strong>
                  </span>
                )}
              </div>

              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ondjo-muted" />
                <Input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 8 caracteres"
                  className="h-12 rounded-xl ondjo-border-interactive bg-white pl-10 pr-12 text-sm text-ondjo-ink placeholder:text-slate-400"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="focus-ring absolute right-2.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-ondjo-muted hover:bg-ondjo-bg cursor-pointer"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              {/* Barra de força visual */}
              {password && (
                <div className="mt-2 flex gap-1.5">
                  <div className={`h-1 flex-1 rounded-full ${passwordStrength.level >= 1 ? passwordStrength.color : "bg-ondjo-border"}`} />
                  <div className={`h-1 flex-1 rounded-full ${passwordStrength.level >= 2 ? passwordStrength.color : "bg-ondjo-border"}`} />
                  <div className={`h-1 flex-1 rounded-full ${passwordStrength.level >= 3 ? passwordStrength.color : "bg-ondjo-border"}`} />
                </div>
              )}
            </div>

            <div>
              <AuthInput
                id="register-password-confirm"
                type="password"
                label="Confirmar palavra-passe"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="Repita a palavra-passe anterior"
              />
            </div>
          </m.div>
        )}

        {step === 4 && (
          <m.div
            key="step-4"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="space-y-4"
          >
            {/* Resumo visual dos dados */}
            <div className="ondjo-border-surface rounded-2xl bg-ondjo-bg/70 p-4 sm:p-5 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-ondjo-muted">
                Resumo do perfil a criar
              </p>

              <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3 pt-1 text-sm">
                <div className="min-w-0">
                  <span className="block text-xs text-ondjo-muted">Perfil:</span>
                  <strong className="text-ondjo-navy capitalize">{role}</strong>
                </div>
                <div className="min-w-0">
                  <span className="block text-xs text-ondjo-muted">Nome:</span>
                  <strong className="text-ondjo-navy truncate block">{firstName} {lastName}</strong>
                </div>
                <div className="min-w-0">
                  <span className="block text-xs text-ondjo-muted">Telefone:</span>
                  <strong className="text-ondjo-navy tabular-nums">{phone || "+244 ..."}</strong>
                </div>
                <div className="min-w-0">
                  <span className="block text-xs text-ondjo-muted">Email:</span>
                  <strong className="text-ondjo-navy truncate block">{email || "exemplo@email.com"}</strong>
                </div>
              </div>
            </div>

            <label
              htmlFor={termsId}
              className="ondjo-border-interactive flex items-start gap-3 rounded-2xl bg-white p-4 cursor-pointer"
            >
              <Checkbox
                id={termsId}
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(Boolean(checked))}
                className="mt-0.5"
              />
              <span className="text-xs leading-relaxed text-ondjo-ink">
                Declaro que li e aceito os <strong>Termos de Utilização</strong> e a <strong>Política de Privacidade</strong> do ONDJO para navegação e publicação no mercado angolano.
              </span>
            </label>
          </m.div>
        )}

        {/* Botões de navegação dos passos */}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={previous}
              leftIcon={<ArrowLeft className="size-4" />}
              className="min-h-12 rounded-xl px-5 text-sm font-bold"
            >
              Voltar
            </Button>
          ) : (
            <a
              href="#/login"
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-xl px-5 text-sm font-bold text-ondjo-muted hover:text-ondjo-ink hover:bg-ondjo-bg transition-colors"
            >
              Já tenho conta
            </a>
          )}

          {step < 4 ? (
            <Button
              type="button"
              variant="primary"
              onClick={next}
              rightIcon={<ArrowRight className="size-4" />}
              className="min-h-12 rounded-xl px-6 text-sm font-bold shadow-sm"
            >
              Continuar
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              disabled={!termsAccepted}
              rightIcon={<Check className="size-4" />}
              className="min-h-12 rounded-xl px-6 text-sm font-bold shadow-sm"
            >
              Criar conta
            </Button>
          )}
        </div>
      </form>
    </AuthLayout>
  );
}
