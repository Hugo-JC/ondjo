import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  X,
} from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";

type ScheduleVisitPanelProps = {
  open: boolean;
  onClose: () => void;
  propertyTitle: string;
  propertyLocation: string;
};

const TIME_SLOTS = [
  { value: "09:00", label: "09:00 — Manhã" },
  { value: "11:00", label: "11:00 — Manhã" },
  { value: "14:00", label: "14:00 — Tarde" },
  { value: "16:00", label: "16:00 — Tarde" },
  { value: "18:00", label: "18:00 — Final do dia" },
] as const;

export function ScheduleVisitPanel({
  open,
  onClose,
  propertyTitle,
  propertyLocation,
}: ScheduleVisitPanelProps) {
  const titleId = useId();
  const descId = useId();
  const reduceMotion = useReducedMotion();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const minDate = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!open) return;

    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setSubmitted(false);
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 700);
  };

  const motionProps = reduceMotion
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.96, y: 12 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.96, y: 12 },
      };

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
          className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4"
        >
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label="Fechar agendamento"
            className="fixed inset-0 cursor-default bg-ondjo-navy/45 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.div
            {...motionProps}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative z-10 flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-[28px] border border-ondjo-border bg-ondjo-surface shadow-[0_24px_80px_rgba(16,42,67,0.18)] sm:rounded-[28px]"
          >
            <div className="border-b border-ondjo-border px-5 py-4 sm:px-6">
              <div
                className="mx-auto mb-3 h-1 w-10 rounded-full bg-ondjo-border sm:hidden"
                aria-hidden="true"
              />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-ondjo-blue">
                    <CalendarDays size={20} aria-hidden="true" />
                    <h2
                      id={titleId}
                      className="text-lg font-black tracking-tight text-ondjo-navy"
                    >
                      Agendar visita
                    </h2>
                  </div>
                  <p id={descId} className="mt-1 text-xs leading-5 text-ondjo-muted">
                    Escolha data e horário. O proprietário ou corretor confirmará
                    consigo — sem taxas de agendamento na plataforma.
                  </p>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  className="focus-ring grid size-10 shrink-0 place-items-center rounded-xl text-ondjo-muted transition hover:bg-ondjo-bg hover:text-ondjo-ink"
                  aria-label="Fechar janela de agendamento"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto px-5 py-4 sm:px-6">
              <div className="rounded-2xl border border-ondjo-border bg-ondjo-bg p-3.5">
                <p className="line-clamp-2 text-sm font-bold text-ondjo-ink">
                  {propertyTitle}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-ondjo-muted">
                  <MapPin size={13} className="shrink-0 text-ondjo-blue" aria-hidden="true" />
                  {propertyLocation}
                </p>
              </div>

              {submitted ? (
                <div className="py-8 text-center">
                  <CheckCircle2
                    className="mx-auto size-11 text-ondjo-success"
                    aria-hidden="true"
                  />
                  <p className="mt-3 text-base font-black text-ondjo-navy">
                    Pedido enviado
                  </p>
                  <p className="mt-2 text-xs leading-5 text-ondjo-muted">
                    Receberá confirmação por telefone ou mensagem quando o horário
                    for aceite. Pode acompanhar também na área de conversas.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="focus-ring mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-ondjo-blue px-4 text-sm font-extrabold text-white transition-colors hover:bg-ondjo-blue-dark"
                  >
                    Concluir
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block sm:col-span-1">
                      <span className="mb-1.5 block text-xs font-bold text-ondjo-ink">
                        Data preferida
                      </span>
                      <input
                        type="date"
                        required
                        min={minDate}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="filter-input"
                      />
                    </label>
                    <label className="block sm:col-span-1">
                      <span className="mb-1.5 flex items-center gap-1 text-xs font-bold text-ondjo-ink">
                        <Clock size={13} aria-hidden="true" />
                        Horário
                      </span>
                      <select
                        required
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="filter-input"
                      >
                        <option value="" disabled>
                          Selecionar
                        </option>
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot.value} value={slot.value}>
                            {slot.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1 text-xs font-bold text-ondjo-ink">
                      <User size={13} aria-hidden="true" />
                      Nome completo
                    </span>
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Como devemos tratá-lo"
                      className="filter-input"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1 text-xs font-bold text-ondjo-ink">
                      <Phone size={13} aria-hidden="true" />
                      Telefone
                    </span>
                    <input
                      type="tel"
                      required
                      autoComplete="tel"
                      inputMode="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+244 9XX XXX XXX"
                      className="filter-input"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-ondjo-ink">
                      Notas (opcional)
                    </span>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ex.: visita com família, preferência por estacionamento..."
                      className="filter-input min-h-[88px] resize-none py-2.5"
                    />
                  </label>

                  <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={onClose}
                      className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl border border-ondjo-border px-4 text-sm font-bold text-ondjo-ink transition hover:bg-ondjo-bg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-ondjo-blue px-5 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-ondjo-blue-dark disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {submitting ? "A enviar…" : "Pedir agendamento"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
