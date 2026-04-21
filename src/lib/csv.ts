export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = value instanceof Date ? value.toISOString() : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(header: string[], rows: unknown[][]): string {
  const lines = [header.join(",")];
  for (const row of rows) lines.push(row.map(csvCell).join(","));
  return lines.join("\n");
}

export function csvResponseHeaders(filenameBase: string): HeadersInit {
  const stamp = new Date().toISOString().slice(0, 10);
  return {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": `attachment; filename="${filenameBase}-${stamp}.csv"`,
  };
}
