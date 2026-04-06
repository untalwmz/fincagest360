import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ingresosTable, gastosTable, inversionesTable } from "@workspace/db";
import {
  ListIngresosResponse,
  CreateIngresoBody,
  DeleteIngresoParams,
  ListGastosResponse,
  CreateGastoBody,
  DeleteGastoParams,
  ListInversionesResponse,
  CreateInversionBody,
  GetFinanzasResumenResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function mapIngreso(r: typeof ingresosTable.$inferSelect) {
  return {
    id: r.id,
    fincaId: r.fincaId ?? undefined,
    concepto: r.concepto,
    monto: Number(r.monto),
    fecha: r.fecha,
    categoria: r.categoria,
    notas: r.notas ?? undefined,
  };
}
function mapGasto(r: typeof gastosTable.$inferSelect) {
  return {
    id: r.id,
    fincaId: r.fincaId ?? undefined,
    concepto: r.concepto,
    monto: Number(r.monto),
    fecha: r.fecha,
    categoria: r.categoria,
    notas: r.notas ?? undefined,
  };
}
function mapInversion(r: typeof inversionesTable.$inferSelect) {
  return {
    id: r.id,
    fincaId: r.fincaId ?? undefined,
    descripcion: r.descripcion,
    monto: Number(r.monto),
    fecha: r.fecha,
    tipo: r.tipo,
    retornoEsperado: r.retornoEsperado ? Number(r.retornoEsperado) : undefined,
    notas: r.notas ?? undefined,
  };
}

router.get("/finanzas/ingresos", async (_req, res): Promise<void> => {
  const records = await db.select().from(ingresosTable).orderBy(ingresosTable.fecha);
  res.json(ListIngresosResponse.parse(records.map(mapIngreso)));
});

router.post("/finanzas/ingresos", async (req, res): Promise<void> => {
  const parsed = CreateIngresoBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [record] = await db.insert(ingresosTable).values({ ...parsed.data, monto: String(parsed.data.monto) }).returning();
  res.status(201).json(mapIngreso(record));
});

router.delete("/finanzas/ingresos/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteIngresoParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(ingresosTable).where(eq(ingresosTable.id, params.data.id));
  res.sendStatus(204);
});

router.get("/finanzas/gastos", async (_req, res): Promise<void> => {
  const records = await db.select().from(gastosTable).orderBy(gastosTable.fecha);
  res.json(ListGastosResponse.parse(records.map(mapGasto)));
});

router.post("/finanzas/gastos", async (req, res): Promise<void> => {
  const parsed = CreateGastoBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [record] = await db.insert(gastosTable).values({ ...parsed.data, monto: String(parsed.data.monto) }).returning();
  res.status(201).json(mapGasto(record));
});

router.delete("/finanzas/gastos/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteGastoParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(gastosTable).where(eq(gastosTable.id, params.data.id));
  res.sendStatus(204);
});

router.get("/finanzas/inversiones", async (_req, res): Promise<void> => {
  const records = await db.select().from(inversionesTable).orderBy(inversionesTable.fecha);
  res.json(ListInversionesResponse.parse(records.map(mapInversion)));
});

router.post("/finanzas/inversiones", async (req, res): Promise<void> => {
  const parsed = CreateInversionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [record] = await db.insert(inversionesTable).values({
    ...parsed.data,
    monto: String(parsed.data.monto),
    retornoEsperado: parsed.data.retornoEsperado != null ? String(parsed.data.retornoEsperado) : null,
  }).returning();
  res.status(201).json(mapInversion(record));
});

router.get("/finanzas/resumen", async (_req, res): Promise<void> => {
  const ingresos = await db.select().from(ingresosTable);
  const gastos = await db.select().from(gastosTable);
  const inversiones = await db.select().from(inversionesTable);

  const totalIngresos = ingresos.reduce((s, r) => s + Number(r.monto), 0);
  const totalGastos = gastos.reduce((s, r) => s + Number(r.monto), 0);
  const totalInversiones = inversiones.reduce((s, r) => s + Number(r.monto), 0);
  const balanceNeto = totalIngresos - totalGastos;
  const rentabilidad = totalIngresos > 0 ? ((balanceNeto / totalIngresos) * 100) : 0;

  // Build monthly flow for last 6 months
  const monthMap: Record<string, { ingresos: number; gastos: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap[key] = { ingresos: 0, gastos: 0 };
  }
  for (const r of ingresos) {
    const key = r.fecha.slice(0, 7);
    if (monthMap[key]) monthMap[key].ingresos += Number(r.monto);
  }
  for (const r of gastos) {
    const key = r.fecha.slice(0, 7);
    if (monthMap[key]) monthMap[key].gastos += Number(r.monto);
  }
  const flujoMensual = Object.entries(monthMap).map(([mes, d]) => ({ mes, ...d }));

  res.json(GetFinanzasResumenResponse.parse({ totalIngresos, totalGastos, totalInversiones, balanceNeto, rentabilidad, flujoMensual }));
});

export default router;
