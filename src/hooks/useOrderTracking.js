"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Fetch a single order's detail and expose a manual refresh + light polling.
 * @param {string} orderId
 * @param {{ pollMs?: number }} [opts]
 */
export function useOrderTracking(orderId, opts = {}) {
  const { pollMs = 0 } = opts;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Gagal memuat order");
      setOrder(json.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!pollMs) return;
    const t = setInterval(refresh, pollMs);
    return () => clearInterval(t);
  }, [pollMs, refresh]);

  return { order, loading, error, refresh };
}
