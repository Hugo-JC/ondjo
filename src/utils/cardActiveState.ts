/**
 * Gerenciador de estado para sincronizar cartões de imóveis ativos.
 * Garante que, ao interagir com um cartão, outros cartões voltem ao estado inicial.
 */
type ActiveCardListener = (activeId: string | null) => void;

const listeners = new Set<ActiveCardListener>();
let currentActiveCardId: string | null = null;

export function setActiveCard(id: string | null) {
  if (currentActiveCardId === id) return;
  currentActiveCardId = id;
  listeners.forEach((listener) => {
    try {
      listener(id);
    } catch (e) {
      console.error("Erro no listener de activeCard:", e);
    }
  });
}

export function getActiveCardId(): string | null {
  return currentActiveCardId;
}

export function subscribeActiveCard(listener: ActiveCardListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
