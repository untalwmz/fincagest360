import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, nominaTable, empleadosTable } from "@workspace/db";
import {
  ListNominaResponse,
  CreateNominaBody,
  DeleteNominaParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function mapNomina(r: typeof nominaTable.$inferSelect) {
  const salarioBase = Number(r.salarioBase);
  const bonificaciones = Number(r.bonificaciones ?? 0);
  const deducciones = Number(r.deducciones ?? 0);
  const totalPagar = salarioBase + bonificaciones - deducciones;
  return {
    id: r.id,
    empleadoId: r.empleadoId,
    empleadoNombre: r.empleadoNombre,
    periodo: r.periodo,
    diasTrabajados: r.diasTrabajados,
    salarioBase,
    bonificaciones,
    deducciones,
    totalPagar,
    estado: r.estado,
    fechaPago: r.fechaPago ?? undefined,
  };
}

router.get("/nomina", async (_req, res): Promise<void> => {
  const records = await db.select().from(nominaTable).orderBy(nominaTable.periodo);
  res.json(ListNominaResponse.parse(records.map(mapNomina)));
});

router.post("/nomina", async (req, res): Promise<void> => {
  const parsed = CreateNominaBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [empleado] = await db.select().from(empleadosTable).where(eq(empleadosTable.id, parsed.data.empleadoId));
  const empleadoNombre = empleado?.nombre ?? "Sin nombre";

  const [record] = await db.insert(nominaTable).values({
    empleadoId: parsed.data.empleadoId,
    empleadoNombre,
    periodo: parsed.data.periodo,
    diasTrabajados: parsed.data.diasTrabajados,
    salarioBase: String(parsed.data.salarioBase),
    bonificaciones: parsed.data.bonificaciones != null ? String(parsed.data.bonificaciones) : "0",
    deducciones: parsed.data.deducciones != null ? String(parsed.data.deducciones) : "0",
    estado: parsed.data.estado,
    fechaPago: parsed.data.fechaPago,
  }).returning();
  res.status(201).json(mapNomina(record));
});

router.delete("/nomina/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteNominaParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(nominaTable).where(eq(nominaTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
