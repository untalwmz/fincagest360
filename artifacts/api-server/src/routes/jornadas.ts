import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, jornadasTable, empleadosTable } from "@workspace/db";
import {
  ListJornadasResponse,
  CreateJornadaBody,
  DeleteJornadaParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/jornadas", async (_req, res): Promise<void> => {
  const records = await db.select().from(jornadasTable).orderBy(jornadasTable.fecha);
  const empleados = await db.select().from(empleadosTable);
  const empMap: Record<number, string> = {};
  for (const e of empleados) empMap[e.id] = e.nombre;
  const mapped = records.map(r => ({
    id: r.id,
    empleadoId: r.empleadoId,
    fincaId: r.fincaId,
    fecha: r.fecha,
    horasRegulares: Number(r.horasRegulares),
    horasExtra: Number(r.horasExtra ?? 0),
    actividad: r.actividad,
    notas: r.notas ?? undefined,
    empleadoNombre: empMap[r.empleadoId] ?? "Desconocido",
  }));
  res.json(ListJornadasResponse.parse(mapped));
});

router.post("/jornadas", async (req, res): Promise<void> => {
  const parsed = CreateJornadaBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [record] = await db.insert(jornadasTable).values({
    ...parsed.data,
    horasRegulares: String(parsed.data.horasRegulares),
    horasExtra: parsed.data.horasExtra != null ? String(parsed.data.horasExtra) : "0",
  }).returning();
  const [emp] = await db.select().from(empleadosTable).where(eq(empleadosTable.id, record.empleadoId));
  res.status(201).json({
    id: record.id,
    empleadoId: record.empleadoId,
    fincaId: record.fincaId,
    fecha: record.fecha,
    horasRegulares: Number(record.horasRegulares),
    horasExtra: Number(record.horasExtra ?? 0),
    actividad: record.actividad,
    notas: record.notas ?? undefined,
    empleadoNombre: emp?.nombre ?? "Desconocido",
  });
});

router.delete("/jornadas/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteJornadaParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(jornadasTable).where(eq(jornadasTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
