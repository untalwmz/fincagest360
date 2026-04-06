import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, cosechaTable } from "@workspace/db";
import {
  ListCosechaResponse,
  CreateCosechaBody,
  DeleteCosechaParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function mapCosecha(r: typeof cosechaTable.$inferSelect) {
  return {
    id: r.id,
    fincaId: r.fincaId,
    loteId: r.loteId ?? undefined,
    fecha: r.fecha,
    cultivo: r.cultivo,
    cantidadKg: Number(r.cantidadKg),
    calidad: r.calidad,
    responsable: r.responsable ?? undefined,
    precioVenta: r.precioVenta ? Number(r.precioVenta) : undefined,
    comprador: r.comprador ?? undefined,
    notas: r.notas ?? undefined,
  };
}

router.get("/cosecha", async (_req, res): Promise<void> => {
  const records = await db.select().from(cosechaTable).orderBy(cosechaTable.fecha);
  res.json(ListCosechaResponse.parse(records.map(mapCosecha)));
});

router.post("/cosecha", async (req, res): Promise<void> => {
  const parsed = CreateCosechaBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [record] = await db.insert(cosechaTable).values({
    ...parsed.data,
    cantidadKg: String(parsed.data.cantidadKg),
    precioVenta: parsed.data.precioVenta != null ? String(parsed.data.precioVenta) : null,
  }).returning();
  res.status(201).json(mapCosecha(record));
});

router.delete("/cosecha/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteCosechaParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(cosechaTable).where(eq(cosechaTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
