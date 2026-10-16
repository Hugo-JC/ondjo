import { useState, useEffect } from "react";

interface NetworkInformation extends EventTarget {
  saveData?: boolean;
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
}

/**
 * Hook para deteção do modo de poupança de dados no navegador.
 * Especialmente útil no contexto de redes móveis e consumo de dados em Angola.
 */
export function useSaveData(): { isSaveData: boolean; isSlowConnection: boolean } {
  const [isSaveData, setIsSaveData] = useState<boolean>(() => {
    if (typeof navigator !== "undefined" && "connection" in navigator) {
      const conn = (navigator as unknown as { connection?: NetworkInformation }).connection;
      return Boolean(conn?.saveData);
    }
    return false;
  });

  const [isSlowConnection, setIsSlowConnection] = useState<boolean>(() => {
    if (typeof navigator !== "undefined" && "connection" in navigator) {
      const conn = (navigator as unknown as { connection?: NetworkInformation }).connection;
      return conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g";
    }
    return false;
  });

  useEffect(() => {
    if (typeof navigator === "undefined" || !("connection" in navigator)) return;
    const conn = (navigator as unknown as { connection?: NetworkInformation }).connection;
    if (!conn) return;

    const updateConnection = () => {
      setIsSaveData(Boolean(conn.saveData));
      setIsSlowConnection(conn.effectiveType === "2g" || conn.effectiveType === "slow-2g");
    };

    conn.addEventListener?.("change", updateConnection);
    return () => {
      conn.removeEventListener?.("change", updateConnection);
    };
  }, []);

  return { isSaveData, isSlowConnection };
}
