import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, produccionTable } from "@workspace/db";
import {
  ListProduccionResponse,
  ListProduccionQueryParams,
  CreateProduccionBody,
  DeleteProduccionParams,
  GetProduccionSummaryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function mapProd(p: typeof produccionTable.$inferSelect) {
  return {
    id: p.id,
    fincaId: p.fincaId,
    loteId: p.loteId ?? undefined,
    fecha: p.fecha,
    cultivo: p.cultivo,
    cantidadKg: Number(p.cantidadKg),
    valorUnitario: Number(p.valorUnitario),
    total: Number(p.cantidadKg) * Number(p.valorUnitario),
    notas: p.notas ?? undefined,
  };
}

router.get("/produccion", async (req, res): Promise<void> => {
  const qp = ListProduccionQueryParams.safeParse(req.query);
  let query = db.select().from(produccionTable).$dynamic();
  if (qp.success) {
    if (qp.data.fincaId) query = query.where(eq(produccionTable.fincaId, qp.data.fincaId)) as typeof query;
    if (qp.data.loteId) query = query.where(eq(produccionTable.loteId, qp.data.loteId)) as typeof query;
  }
  const records = await query.orderBy(produccionTable.fecha);
  res.json(ListProduccionResponse.parse(records.map(mapProd)));
});

router.post("/produccion", async (req, res): Promise<void> => {
  const parsed = CreateProduccionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [record] = await db.insert(produccionTable).values({
    ...parsed.data,
    cantidadKg: String(parsed.data.cantidadKg),
    valorUnitario: String(parsed.data.valorUnitario),
  }).returning();
  res.status(201).json(mapProd(record));
});

router.delete("/produccion/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteProduccionParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(produccionTable).where(eq(produccionTable.id, params.data.id));
  res.sendStatus(204);
});

router.get("/produccion/summary", async (_req, res): Promise<void> => {
  const now = new Date();
  const mesActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const anioActual = String(now.getFullYear());

  const allRecords = await db.select().from(produccionTable);
  const mesProd = allRecords.filter(r => r.fecha.startsWith(mesActual));
  const anioProd = allRecords.filter(r => r.fecha.startsWith(anioActual));

  const totalKgMes = mesProd.reduce((s, r) => s + Number(r.cantidadKg), 0);
  const totalKgAnio = anioProd.reduce((s, r) => s + Number(r.cantidadKg), 0);
  const valorTotalMes = mesProd.reduce((s, r) => s + Number(r.cantidadKg) * Number(r.valorUnitario), 0);
  const valorTotalAnio = anioProd.reduce((s, r) => s + Number(r.cantidadKg) * Number(r.valorUnitario), 0);

  const cultivoMap: Record<string, { kg: number; valor: number }> = {};
  for (const r of allRecords) {
    if (!cultivoMap[r.cultivo]) cultivoMap[r.cultivo] = { kg: 0, valor: 0 };
    cultivoMap[r.cultivo].kg += Number(r.cantidadKg);
    cultivoMap[r.cultivo].valor += Number(r.cantidadKg) * Number(r.valorUnitario);
  }
  const porCultivo = Object.entries(cultivoMap).map(([cultivo, d]) => ({ cultivo, kg: d.kg, valor: d.valor }));

  res.json(GetProduccionSummaryResponse.parse({ totalKgMes, totalKgAnio, valorTotalMes, valorTotalAnio, porCultivo }));
});

export default router;
