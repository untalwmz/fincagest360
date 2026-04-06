import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, insumosTable } from "@workspace/db";
import {
  ListInsumosResponse,
  CreateInsumoBody,
  DeleteInsumoParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function mapInsumo(r: typeof insumosTable.$inferSelect) {
  return {
    id: r.id,
    fincaId: r.fincaId ?? undefined,
    nombre: r.nombre,
    tipo: r.tipo,
    cantidad: Number(r.cantidad),
    unidad: r.unidad,
    costoUnitario: Number(r.costoUnitario),
    stockMinimo: r.stockMinimo ? Number(r.stockMinimo) : undefined,
    proveedor: r.proveedor ?? undefined,
    fechaCompra: r.fechaCompra ?? undefined,
  };
}

router.get("/insumos", async (_req, res): Promise<void> => {
  const records = await db.select().from(insumosTable).orderBy(insumosTable.nombre);
  res.json(ListInsumosResponse.parse(records.map(mapInsumo)));
});

router.post("/insumos", async (req, res): Promise<void> => {
  const parsed = CreateInsumoBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [record] = await db.insert(insumosTable).values({
    ...parsed.data,
    cantidad: String(parsed.data.cantidad),
    costoUnitario: String(parsed.data.costoUnitario),
    stockMinimo: parsed.data.stockMinimo != null ? String(parsed.data.stockMinimo) : null,
  }).returning();
  res.status(201).json(mapInsumo(record));
});

router.delete("/insumos/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteInsumoParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(insumosTable).where(eq(insumosTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
