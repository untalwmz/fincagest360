import { Router, type IRouter } from "express";
import { db, fincasTable, empleadosTable, produccionTable, ingresosTable, gastosTable } from "@workspace/db";
import {
  GetDashboardSummaryResponse,
  GetDashboardRecentActivityResponse,
  GetDashboardMonthlyRevenueResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [fincas, empleados, produccion, ingresos, gastos] = await Promise.all([
    db.select().from(fincasTable),
    db.select().from(empleadosTable),
    db.select().from(produccionTable),
    db.select().from(ingresosTable),
    db.select().from(gastosTable),
  ]);

  const now = new Date();
  const mesActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const mesProd = produccion.filter(r => r.fecha.startsWith(mesActual));
  const produccionMesKg = mesProd.reduce((s, r) => s + Number(r.cantidadKg), 0);

  const totalIngresos = ingresos.reduce((s, r) => s + Number(r.monto), 0);
  const totalGastos = gastos.reduce((s, r) => s + Number(r.monto), 0);
  const balanceNeto = totalIngresos - totalGastos;
  const rentabilidad = totalIngresos > 0 ? (balanceNeto / totalIngresos) * 100 : 0;

  res.json(GetDashboardSummaryResponse.parse({
    totalIngresos,
    totalGastos,
    balanceNeto,
    totalFincas: fincas.length,
    totalEmpleados: empleados.length,
    produccionMesKg,
    rentabilidad,
  }));
});

router.get("/dashboard/recent-activity", async (_req, res): Promise<void> => {
  const [ingresos, gastos, produccion] = await Promise.all([
    db.select().from(ingresosTable).orderBy(ingresosTable.fecha),
    db.select().from(gastosTable).orderBy(gastosTable.fecha),
    db.select().from(produccionTable).orderBy(produccionTable.fecha),
  ]);

  type Act = { id: number; tipo: string; descripcion: string; monto: number | null; fecha: string; icono: string };
  const events: Act[] = [];

  for (const r of ingresos.slice(-5)) {
    events.push({ id: r.id * 100, tipo: "ingreso", descripcion: r.concepto, monto: Number(r.monto), fecha: r.fecha, icono: "trending-up" });
  }
  for (const r of gastos.slice(-5)) {
    events.push({ id: r.id * 100 + 1, tipo: "gasto", descripcion: r.concepto, monto: Number(r.monto), fecha: r.fecha, icono: "trending-down" });
  }
  for (const r of produccion.slice(-3)) {
    events.push({ id: r.id * 100 + 2, tipo: "produccion", descripcion: `${r.cultivo}: ${Number(r.cantidadKg)} kg`, fecha: r.fecha, icono: "sprout" });
  }

  events.sort((a, b) => b.fecha.localeCompare(a.fecha));

  res.json(GetDashboardRecentActivityResponse.parse(events.slice(0, 10)));
});

router.get("/dashboard/monthly-revenue", async (_req, res): Promise<void> => {
  const [ingresos, gastos, produccion] = await Promise.all([
    db.select().from(ingresosTable),
    db.select().from(gastosTable),
    db.select().from(produccionTable),
  ]);

  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  const data = months.map(m => {
    const [, monthStr] = m.split("-");
    const monthIdx = parseInt(monthStr, 10) - 1;
    return {
      mes: monthNames[monthIdx],
      ingresos: ingresos.filter(r => r.fecha.startsWith(m)).reduce((s, r) => s + Number(r.monto), 0),
      gastos: gastos.filter(r => r.fecha.startsWith(m)).reduce((s, r) => s + Number(r.monto), 0),
      produccion: produccion.filter(r => r.fecha.startsWith(m)).reduce((s, r) => s + Number(r.cantidadKg) * Number(r.valorUnitario), 0),
    };
  });

  res.json(GetDashboardMonthlyRevenueResponse.parse(data));
});

export default router;
