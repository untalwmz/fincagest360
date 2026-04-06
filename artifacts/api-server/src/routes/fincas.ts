import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, fincasTable } from "@workspace/db";
import {
  ListFincasResponse,
  CreateFincaBody,
  GetFincaParams,
  GetFincaResponse,
  UpdateFincaParams,
  UpdateFincaBody,
  UpdateFincaResponse,
  DeleteFincaParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/fincas", async (_req, res): Promise<void> => {
  const fincas = await db.select().from(fincasTable).orderBy(fincasTable.createdAt);
  const mapped = fincas.map(f => ({
    ...f,
    hectareas: Number(f.hectareas),
    createdAt: f.createdAt?.toISOString() ?? null,
  }));
  res.json(ListFincasResponse.parse(mapped));
});

router.post("/fincas", async (req, res): Promise<void> => {
  const parsed = CreateFincaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [finca] = await db.insert(fincasTable).values({
    ...parsed.data,
    hectareas: String(parsed.data.hectareas),
  }).returning();
  res.status(201).json(GetFincaResponse.parse({ ...finca, hectareas: Number(finca.hectareas), createdAt: finca.createdAt?.toISOString() ?? null }));
});

router.get("/fincas/:id", async (req, res): Promise<void> => {
  const params = GetFincaParams.safeParse({ id: parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const [finca] = await db.select().from(fincasTable).where(eq(fincasTable.id, params.data.id));
  if (!finca) { res.status(404).json({ error: "Not found" }); return; }
  res.json(GetFincaResponse.parse({ ...finca, hectareas: Number(finca.hectareas), createdAt: finca.createdAt?.toISOString() ?? null }));
});

router.put("/fincas/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateFincaParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateFincaBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [finca] = await db.update(fincasTable).set({
    ...parsed.data,
    hectareas: parsed.data.hectareas !== undefined ? String(parsed.data.hectareas) : undefined,
  }).where(eq(fincasTable.id, params.data.id)).returning();
  if (!finca) { res.status(404).json({ error: "Not found" }); return; }
  res.json(UpdateFincaResponse.parse({ ...finca, hectareas: Number(finca.hectareas), createdAt: finca.createdAt?.toISOString() ?? null }));
});

router.delete("/fincas/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteFincaParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(fincasTable).where(eq(fincasTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
