import test from "node:test";
import assert from "node:assert/strict";
import { filterProperties } from "./filterProperties";
import { properties } from "../data/properties";

test("filters properties by purpose (comprar vs arrendar)", () => {
  const venda = filterProperties(properties, { purpose: "comprar" });
  const arrendar = filterProperties(properties, { purpose: "arrendar" });

  assert.ok(venda.length > 0, "expected venda properties");
  assert.ok(arrendar.length > 0, "expected arrendamento properties");
  assert.ok(venda.every((p) => p.purpose === "venda"));
  assert.ok(arrendar.every((p) => p.purpose === "arrendamento"));
});

test("filters properties by neighborhood and query text", () => {
  const talatona = filterProperties(properties, { location: "Talatona" });
  assert.ok(talatona.length > 0);
  assert.ok(
    talatona.every(
      (p) =>
        p.neighborhood.toLowerCase() === "talatona" ||
        p.city.toLowerCase() === "talatona",
    ),
  );

  const piscina = filterProperties(properties, { amenities: ["Piscina"] });
  assert.ok(piscina.length > 0);
  assert.ok(
    piscina.every((p) =>
      `${(p.features || []).join(" ")} ${p.description}`.toLowerCase().includes("piscina"),
    ),
  );
});

test("filters properties by origin (verificados, proprietario, agentes)", () => {
  const verificados = filterProperties(properties, { origin: "verificados" });
  assert.ok(verificados.length > 0);
  assert.ok(verificados.every((p) => p.verified));

  const proprietario = filterProperties(properties, { origin: "proprietario" });
  assert.ok(
    proprietario.every((p) => !p.advertiser || p.advertiser.type === "particular"),
  );
});

test("filters properties by price range and bedrooms", () => {
  const min = 500000;
  const max = 2500000;
  const ranged = filterProperties(properties, { minPrice: min, maxPrice: max });
  assert.ok(ranged.every((p) => p.price >= min && p.price <= max));

  const t4Plus = filterProperties(properties, { bedrooms: "4" });
  assert.ok(t4Plus.every((p) => p.bedrooms >= 4));
});
