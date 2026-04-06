import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, lotesTable } from "@workspace/db";
import {
  ListLotesResponse,
  ListLotesQueryParams,
  CreateLoteBody,
  UpdateLoteParams,
  UpdateLoteBody,
  UpdateLoteResponse,
  DeleteLoteParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/lotes", async (req, res): Promise<void> => {
  const qp = ListLotesQueryParams.safeParse(req.query);
  let query = db.select().from(lotesTable).$dynamic();
  if (qp.success && qp.data.fincaId) {
    query = query.where(eq(lotesTable.fincaId, qp.data.fincaId)) as typeof query;
  }
  const lotes = await query;
  const mapped = lotes.map(l => ({ ...l, hectareas: Number(l.hectareas) }));
  res.json(ListLotesResponse.parse(mapped));
});

router.post("/lotes", async (req, res): Promise<void> => {
  const parsed = CreateLoteBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [lote] = await db.insert(lotesTable).values({ ...parsed.data, hectareas: String(parsed.data.hectareas) }).returning();
  res.status(201).json({ ...lote, hectareas: Number(lote.hectareas) });
});

router.put("/lotes/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateLoteParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateLoteBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [lote] = await db.update(lotesTable).set({
    ...parsed.data,
    hectareas: parsed.data.hectareas !== undefined ? String(parsed.data.hectareas) : undefined,
  }).where(eq(lotesTable.id, params.data.id)).returning();
  if (!lote) { res.status(404).json({ error: "Not found" }); return; }
  res.json(UpdateLoteResponse.parse({ ...lote, hectareas: Number(lote.hectareas) }));
});

router.delete("/lotes/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteLoteParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(lotesTable).where(eq(lotesTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
