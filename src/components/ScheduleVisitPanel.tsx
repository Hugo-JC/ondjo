import {
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Textarea,
} from "./ui";
import { cn } from "@/lib/utils";

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
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [timeError, setTimeError] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitTimerRef = useRef<number | null>(null);
  const minDate = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!open) {
      setSubmitted(false);
      setSubmitting(false);
      setTimeError(false);
      if (submitTimerRef.current !== null) {
        window.clearTimeout(submitTimerRef.current);
        submitTimerRef.current = null;
      }
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (submitTimerRef.current !== null) {
        window.clearTimeout(submitTimerRef.current);
      }
    };
  }, []);

  const selectedTimeLabel = TIME_SLOTS.find((s) => s.value === time)?.label;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!time) {
      setTimeError(true);
      return;
    }
    setTimeError(false);
    setSubmitting(true);
    submitTimerRef.current = window.setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      submitTimerRef.current = null;
    }, 350);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="flex max-h-[92dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="px-5 pt-5 pb-4 sm:px-6">
          <div className="flex items-center gap-2 text-ondjo-blue">
            <CalendarDays size={19} aria-hidden="true" />
            <DialogTitle className="text-lg font-black tracking-tight text-ondjo-navy">
              Agendar visita
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs leading-5 text-ondjo-muted pr-6">
            Escolha data e horário. O proprietário ou corretor confirmará consigo — sem taxas de agendamento na plataforma.
          </DialogDescription>
        </DialogHeader>

        <Separator className="bg-ondjo-border-hairline" />

        <div className="overflow-y-auto px-5 py-4 sm:px-6">
          <div className="ondjo-border-hairline rounded-2xl bg-ondjo-bg/75 p-3.5">
            <p className="line-clamp-2 text-sm font-bold text-ondjo-ink">
              {propertyTitle}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-ondjo-muted">
              <MapPin
                size={13}
                className="shrink-0 text-ondjo-blue"
                aria-hidden="true"
              />
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
                Receberá confirmação por telefone ou mensagem quando o horário for aceite. Pode acompanhar também na área de conversas.
              </p>
              <Button
                type="button"
                variant="primary"
                fullWidth
                size="md"
                onClick={onClose}
                className="mt-6"
              >
                Concluir
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-1">
                  <span className="mb-1.5 block text-xs font-bold text-ondjo-ink">
                    Data preferida
                  </span>
                  <Input
                    type="date"
                    required
                    min={minDate}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </label>

                <div className="sm:col-span-1">
                  <span className="mb-1.5 flex items-center gap-1 text-xs font-bold text-ondjo-ink">
                    <Clock size={13} aria-hidden="true" />
                    Horário
                  </span>
                  <Select
                    value={time || undefined}
                    onValueChange={(val) => {
                      setTime(String(val ?? ""));
                      setTimeError(false);
                    }}
                  >
                    <SelectTrigger
                      aria-label="Selecionar horário"
                      aria-invalid={timeError}
                      className={cn(
                        "h-11 w-full rounded-xl bg-white px-3 text-xs sm:text-sm font-medium text-ondjo-ink",
                        timeError
                          ? "border-ondjo-danger ring-2 ring-ondjo-danger/15"
                          : "ondjo-border-interactive",
                      )}
                    >
                      <SelectValue placeholder="Selecionar">
                        {selectedTimeLabel || "Selecionar"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent align="start">
                      {TIME_SLOTS.map((slot) => (
                        <SelectItem key={slot.value} value={slot.value}>
                          {slot.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {timeError && (
                    <span className="mt-1 block text-[11px] font-semibold text-ondjo-danger">
                      Escolha um horário.
                    </span>
                  )}
                </div>
              </div>

              <label className="block">
                <span className="mb-1.5 flex items-center gap-1 text-xs font-bold text-ondjo-ink">
                  <User size={13} aria-hidden="true" />
                  Nome completo
                </span>
                <Input
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como devemos tratá-lo"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 flex items-center gap-1 text-xs font-bold text-ondjo-ink">
                  <Phone size={13} aria-hidden="true" />
                  Telefone
                </span>
                <Input
                  type="tel"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+244 9XX XXX XXX"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-ondjo-ink">
                  Notas (opcional)
                </span>
                <Textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex.: visita com família, preferência por estacionamento..."
                  className="min-h-22 resize-none"
                />
              </label>

              <DialogFooter className="mx-0 mb-0 rounded-none border-t border-ondjo-border-hairline bg-transparent px-0 pt-3 pb-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={submitting}
                >
                  {submitting ? "A enviar…" : "Pedir agendamento"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
