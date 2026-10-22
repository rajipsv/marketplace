/** Outcome of a service call; `code` maps to an HTTP status in the API. */
export type Result<T extends object = object> =
  | ({ ok: true } & T)
  | { ok: false; error: string; code: "invalid_input" | "not_found" | "forbidden" | "conflict" | "rate_limited" };
