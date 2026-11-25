import { localDate, validateMovement } from "@/lib/finance";

const today = localDate();
const currentYear = Number(today.slice(0, 4));
const defaults = {
  year: currentYear, month: today.slice(5, 7), page: 1, type: "",
  status: "active", category: "", q: "", from: "", to: "",
};
let filters = { ...defaults };
const monthStart = today.slice(0, 8) + "01";
let rows = [
  { type: "income", category: "Reserva directa", guest: "Huésped de ejemplo",
    reservationId: crypto.randomUUID(), checkIn: monthStart, checkOut: today.slice(0, 8) + "04",
    date: monthStart, amountCents: 18000000, description: "Tres noches de alojamiento" },
  { type: "expense", category: "Lavado de sábanas", date: today,
    amountCents: 3000000, description: "Servicio de ropa blanca" },
].map(row => ({ ...row, id: crypto.randomUUID(), version: 1, currency: "ARS",
  amountArsCents: row.amountCents, exchangeRate: "1", deletedAt: null }));

const changed = () => window.dispatchEvent(new Event("casina-update"));
export function navigate(url) {
  const params = new URL(url, location.href).searchParams;
  filters = { ...defaults, ...Object.fromEntries(params) };
  filters.year = Number(filters.year);
  filters.page = Number(filters.page);
  changed();
}

export async function saveMovementAction(previous, form) {
  const { errors, value } = validateMovement(form);
  const id = form.get("id") || crypto.randomUUID();
  const existing = rows.find(row => row.id === id);
  const reservation = value.reservationId && rows.find(row => row.reservationId === value.reservationId);
  if (value.reservationId && !reservation) errors.reservationId = "No se encontró esa reserva en la demo.";
  if (Object.keys(errors).length) return { ok: false, errors, message: "Revisá los campos indicados." };
  if (reservation) {
    value.checkIn = reservation.checkIn;
    value.checkOut = reservation.checkOut;
    value.guest = value.guest || reservation.guest;
    rows = rows.map(row => row.reservationId === value.reservationId ? { ...row, guest: value.guest } : row);
  } else if (value.checkIn) {
    value.reservationId = crypto.randomUUID();
  }
  rows = [...rows.filter(row => row.id !== id), { ...value, id, version: (existing?.version || 0) + 1, deletedAt: null }];
  changed();
  return { ok: true, message: "Movimiento registrado en la demo." };
}

export async function archiveMovementAction(previous, form) {
  rows = rows.map(row => row.id === form.get("id")
    ? { ...row, version: row.version + 1, deletedAt: form.get("archive") === "true" ? today : null } : row);
  changed();
  return { ok: true, message: "" };
}

export function dashboardData() {
  const yearRows = rows.filter(row => Number(row.date.slice(0, 4)) === filters.year);
  const active = yearRows.filter(row => !row.deletedAt);
  const chart = "Ene Feb Mar Abr May Jun Jul Ago Sep Oct Nov Dic".split(" ").map(name => ({ name, ingresos: 0, gastos: 0 }));
  const period = { income: 0, expense: 0, net: 0 };
  for (const row of active) {
    const month = row.date.slice(5, 7);
    chart[Number(month) - 1][row.type === "income" ? "ingresos" : "gastos"] += row.amountArsCents / 100;
    if (filters.month === "all" || filters.month === month) period[row.type] += row.amountArsCents;
  }
  period.net = period.income - period.expense;
  const annual = filters.month === "all";
  const start = Date.UTC(filters.year, annual ? 0 : Number(filters.month) - 1, 1);
  const end = Date.UTC(filters.year, annual ? 12 : Number(filters.month), 1);
  const stays = new Map();
  for (const row of rows) {
    if (row.deletedAt || !row.reservationId) continue;
    const nights = (Math.min(end, Date.parse(row.checkOut)) - Math.max(start, Date.parse(row.checkIn))) / 86400000;
    if (nights > 0) stays.set(row.reservationId, nights);
  }
  const found = yearRows.filter(row =>
    Boolean(row.deletedAt) === (filters.status === "archived") &&
    (!filters.type || row.type === filters.type) && (!filters.category || row.category === filters.category) &&
    (!filters.from || row.date >= filters.from) && (!filters.to || row.date <= filters.to) &&
    [row.guest, row.category, row.description].some(text => (text || "").toLowerCase().includes(filters.q.toLowerCase()))
  ).reverse().sort((a, b) => b.date.localeCompare(a.date));
  const pages = Math.max(1, Math.ceil(found.length / 20));
  const page = Math.min(pages, Math.max(filters.page, 1));
  return { rows: found.slice((page - 1) * 20, page * 20), pages, total: found.length, filters: { ...filters, page },
    years: [...new Set([currentYear, ...rows.map(row => Number(row.date.slice(0, 4)))])].sort((a,b) => b-a),
    summary: { period, chart, renataCommission: Math.round(period.income / 10), legacyCount: 0,
      reservationCount: stays.size, nights: [...stays.values()].reduce((a,b) => a+b, 0) } };
}
