import test from "node:test";
import assert from "node:assert/strict";
import { formatKz, formatCount } from "./format";

test("formatKz formats Kwanzas with optional monthly suffix", () => {
  const sale = formatKz(45000000);
  assert.ok(sale.endsWith(" Kz"));
  assert.match(sale, /45[\s.\u00a0]000[\s.\u00a0]000 Kz$/);

  const rent = formatKz(750000, { perMonth: true });
  assert.ok(rent.endsWith(" Kz/mês"));
  assert.match(rent, /750[\s.\u00a0]000 Kz\/mês$/);
});

test("formatCount handles singular and plural counts", () => {
  assert.equal(formatCount(1, "imóvel", "imóveis"), "1 imóvel");
  assert.equal(formatCount(0, "imóvel", "imóveis"), "0 imóveis");
  assert.equal(formatCount(5, "quarto", "quartos"), "5 quartos");
});
