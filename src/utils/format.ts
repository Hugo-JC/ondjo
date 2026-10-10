/**
 * Utilitários de formatação para o marketplace ONDJO.
 * Regras: Moeda sempre em Kwanza (Kz) formatada para Angola (pt-AO).
 */

export interface FormatKzOptions {
  perMonth?: boolean;
}

export function formatKz(value: number, options?: FormatKzOptions): string {
  const formatted = new Intl.NumberFormat("pt-AO", {
    maximumFractionDigits: 0,
  }).format(value);

  return options?.perMonth ? `${formatted} Kz/mês` : `${formatted} Kz`;
}

export function formatCount(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
