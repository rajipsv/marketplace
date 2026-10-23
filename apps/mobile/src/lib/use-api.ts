import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

/**
 * Loads `path` from /api/v1 and exposes { data, error, loading, reload, fetchedAt }.
 * Pass null to skip (e.g. while signed out). State is only set when a request
 * finishes; reload() is for pull-to-refresh and after changes.
 */
export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [fetchedAt, setFetchedAt] = useState(0); // when `data` arrived (for "upcoming vs past")
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(path !== null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (path === null) return;
    let active = true;
    api<T>(path)
      .then((d) => {
        if (!active) return;
        setData(d);
        setFetchedAt(Date.now());
        setError(null);
      })
      .catch((e) => active && setError(e instanceof Error ? e.message : "Something went wrong."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [path, version]);

  const reload = useCallback(() => {
    setLoading(true);
    setVersion((v) => v + 1);
  }, []);

  return { data, error, loading, reload, fetchedAt };
}
