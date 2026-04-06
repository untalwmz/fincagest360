import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const empleadosTable = pgTable("empleados", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  cargo: text("cargo").notNull(),
  fincaId: integer("finca_id"),
  telefono: text("telefono"),
  salarioBase: numeric("salario_base", { precision: 12, scale: 2 }).notNull(),
  estado: text("estado").notNull().default("activo"),
  fechaIngreso: text("fecha_ingreso"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEmpleadoSchema = createInsertSchema(empleadosTable).omit({ id: true, createdAt: true });
export type InsertEmpleado = z.infer<typeof insertEmpleadoSchema>;
export type Empleado = typeof empleadosTable.$inferSelect;
