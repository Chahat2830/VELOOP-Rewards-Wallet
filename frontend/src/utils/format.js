export function money(value, currency = "VES") {
  const n = Number(value ?? 0);
  if (["GEMS", "TOKENS", "SPINS"].includes(currency))
    return `${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })} ${currency}`;
  return `${currency === "VES" ? "₹" : ""}${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${currency === "SVES" ? " SVES" : ""}`;
}
export function dateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}
export function label(value = "") {
  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
