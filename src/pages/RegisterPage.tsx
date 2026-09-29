import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Eye,
  EyeOff,
  Home,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import AuthInput from "../components/auth/AuthInput";
import AuthLayout from "../components/auth/AuthLayout";
import RoleCard from "../components/auth/RoleCard";
type Role = "cliente" | "proprietario";
type Step = 1 | 2 | 3 | 4;
export default function RegisterPage() {
  const [step, setStep] = useState<Step>(1);
  const [role, setRole] = useState<Role>("cliente");
  const [showPassword, setShowPassword] = useState(false);
  const [completed, setCompleted] = useState(false);
  const progress = useMemo(() => `${step * 25}%`, [step]);
  const next = () => setStep((v) => (v < 4 ? ((v + 1) as Step) : v));
  const previous = () => setStep((v) => (v > 1 ? ((v - 1) as Step) : v));
  if (completed)
    return (
      <AuthLayout
        eyebrow="Conta preparada"
        title="Tudo pronto para começar."
        description="O fluxo de cadastro está concluído. Agora ligue este estado ao seu backend de autenticação."
      >
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="grid size-12 place-items-center rounded-full bg-emerald-600 text-white">
            <Check className="size-6" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-950">
            Perfil: {role === "cliente" ? "Cliente" : "Proprietário"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            A interface já está preparada para criar a conta. O próximo passo é
            conectar este fluxo ao serviço real de autenticação.
          </p>
          <a
            href="#/"
            className="focus-ring mt-6 inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700"
          >
            Ir para a página inicial
          </a>
        </div>
      </AuthLayout>
    );
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
            ? "Estas informações ajudam a personalizar a sua experiência."
            : step === 3
              ? "Use um email que consiga consultar e uma palavra-passe segura."
              : "Reveja o seu perfil antes de concluir."
      }
    >
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Progresso</span>
          <span>{progress}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-[width] duration-300"
            style={{ width: progress }}
          />
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {["Perfil", "Dados", "Conta", "Finalizar"].map((label, i) => (
            <div
              key={label}
              className={[
                "text-xs font-semibold",
                i + 1 <= step ? "text-blue-600" : "text-slate-400",
              ].join(" ")}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setCompleted(true);
        }}
      >
        {step === 1 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <RoleCard
              title="Quero encontrar um imóvel"
              description="Pesquisar, guardar favoritos, conversar e agendar visitas."
              icon={<Home className="size-5" />}
              selected={role === "cliente"}
              onClick={() => setRole("cliente")}
            />
            <RoleCard
              title="Quero anunciar um imóvel"
              description="Publicar imóveis, gerir anúncios e acompanhar interessados."
              icon={<Building2 className="size-5" />}
              selected={role === "proprietario"}
              onClick={() => setRole("proprietario")}
            />
          </div>
        ) : null}
        {step === 2 ? (
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <AuthInput
                id="register-first-name"
                label="Nome"
                placeholder="Hugo"
                autoComplete="given-name"
                required
                icon={<UserRound className="size-4" />}
              />
              <AuthInput
                id="register-last-name"
                label="Apelido"
                placeholder="Exemplo"
                autoComplete="family-name"
                required
              />
            </div>
            <AuthInput
              id="register-phone"
              label="Telefone"
              type="tel"
              placeholder="+244 9xx xxx xxx"
              autoComplete="tel"
              required
              hint="Será usado para contactos relacionados com a sua conta."
            />
            {role === "cliente" ? (
              <SelectField
                id="client-goal"
                label="O que procura?"
                options={[
                  "Quero arrendar",
                  "Quero comprar",
                  "Ainda não decidi",
                ]}
              />
            ) : (
              <SelectField
                id="owner-goal"
                label="O que pretende anunciar?"
                options={["Arrendamento", "Venda", "Venda e arrendamento"]}
              />
            )}
          </div>
        ) : null}
        {step === 3 ? (
          <div className="space-y-5">
            <AuthInput
              id="register-email"
              name="email"
              type="email"
              label="Email"
              placeholder="exemplo@email.com"
              autoComplete="email"
              required
              icon={<Mail className="size-4" />}
            />
            <div>
              <label
                htmlFor="register-password"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Palavra-passe
              </label>
              <span className="relative block">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="Mínimo de 8 caracteres"
                  className="focus-ring min-h-12 w-full rounded-xl border border-slate-200 bg-white px-10 pr-12 text-sm outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  aria-label={
                    showPassword
                      ? "Ocultar palavra-passe"
                      : "Mostrar palavra-passe"
                  }
                  onClick={() => setShowPassword((v) => !v)}
                  className="focus-ring absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </span>
            </div>
            <AuthInput
              id="register-password-confirm"
              type="password"
              label="Confirmar palavra-passe"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Repita a palavra-passe"
            />
          </div>
        ) : null}
        {step === 4 ? (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Perfil escolhido
              </p>
              <div className="mt-2 flex items-center gap-3">
                {role === "cliente" ? (
                  <Home className="size-5 text-blue-600" />
                ) : (
                  <Building2 className="size-5 text-blue-600" />
                )}
                <span className="font-bold text-slate-950">
                  {role === "cliente" ? "Cliente" : "Proprietário"}
                </span>
              </div>
            </div>
            <label className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <input
                type="checkbox"
                required
                className="mt-1 size-4 accent-blue-600"
              />
              <span className="text-sm leading-6 text-slate-600">
                Li e aceito os termos de utilização e a política de privacidade
                da ONDJO.
              </span>
            </label>
            <p className="text-xs leading-5 text-slate-500">
              Depois do cadastro, poderá completar o seu perfil e, no caso de
              proprietário, começar a preparar o primeiro anúncio.
            </p>
          </div>
        ) : null}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={previous}
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="size-4" />
              Voltar
            </button>
          ) : (
            <a
              href="#/login"
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-xl px-5 text-sm font-bold text-slate-600 hover:bg-slate-100"
            >
              Já tenho conta
            </a>
          )}
          {step < 4 ? (
            <button
              type="button"
              onClick={next}
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white hover:bg-blue-700"
            >
              Continuar
              <ArrowRight className="size-4" />
            </button>
          ) : (
            <button
              type="submit"
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white hover:bg-blue-700"
            >
              Criar conta
              <Check className="size-4" />
            </button>
          )}
        </div>
      </form>
    </AuthLayout>
  );
}
function SelectField({
  id,
  label,
  options,
}: {
  id: string;
  label: string;
  options: string[];
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-800"
      >
        {label}
      </label>
      <select
        id={id}
        className="focus-ring min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none"
        defaultValue={options[0]}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
