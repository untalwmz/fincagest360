import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, empleadosTable } from "@workspace/db";
import {
  ListEmpleadosResponse,
  CreateEmpleadoBody,
  GetEmpleadoParams,
  GetEmpleadoResponse,
  UpdateEmpleadoParams,
  UpdateEmpleadoBody,
  UpdateEmpleadoResponse,
  DeleteEmpleadoParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function mapEmpleado(e: typeof empleadosTable.$inferSelect) {
  return {
    id: e.id,
    nombre: e.nombre,
    cargo: e.cargo,
    fincaId: e.fincaId ?? undefined,
    telefono: e.telefono ?? undefined,
    salarioBase: Number(e.salarioBase),
    estado: e.estado,
    fechaIngreso: e.fechaIngreso ?? undefined,
  };
}

router.get("/empleados", async (_req, res): Promise<void> => {
  const empleados = await db.select().from(empleadosTable).orderBy(empleadosTable.nombre);
  res.json(ListEmpleadosResponse.parse(empleados.map(mapEmpleado)));
});

router.post("/empleados", async (req, res): Promise<void> => {
  const parsed = CreateEmpleadoBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [emp] = await db.insert(empleadosTable).values({ ...parsed.data, salarioBase: String(parsed.data.salarioBase) }).returning();
  res.status(201).json(GetEmpleadoResponse.parse(mapEmpleado(emp)));
});

router.get("/empleados/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetEmpleadoParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const [emp] = await db.select().from(empleadosTable).where(eq(empleadosTable.id, params.data.id));
  if (!emp) { res.status(404).json({ error: "Not found" }); return; }
  res.json(GetEmpleadoResponse.parse(mapEmpleado(emp)));
});

router.put("/empleados/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateEmpleadoParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateEmpleadoBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [emp] = await db.update(empleadosTable).set({
    ...parsed.data,
    salarioBase: parsed.data.salarioBase !== undefined ? String(parsed.data.salarioBase) : undefined,
  }).where(eq(empleadosTable.id, params.data.id)).returning();
  if (!emp) { res.status(404).json({ error: "Not found" }); return; }
  res.json(UpdateEmpleadoResponse.parse(mapEmpleado(emp)));
});

router.delete("/empleados/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteEmpleadoParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(empleadosTable).where(eq(empleadosTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
