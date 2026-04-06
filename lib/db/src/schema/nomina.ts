import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const nominaTable = pgTable("nomina", {
  id: serial("id").primaryKey(),
  empleadoId: integer("empleado_id").notNull(),
  empleadoNombre: text("empleado_nombre").notNull(),
  periodo: text("periodo").notNull(),
  diasTrabajados: integer("dias_trabajados").notNull(),
  salarioBase: numeric("salario_base", { precision: 12, scale: 2 }).notNull(),
  bonificaciones: numeric("bonificaciones", { precision: 12, scale: 2 }).default("0"),
  deducciones: numeric("deducciones", { precision: 12, scale: 2 }).default("0"),
  estado: text("estado").notNull().default("pendiente"),
  fechaPago: text("fecha_pago"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNominaSchema = createInsertSchema(nominaTable).omit({ id: true, createdAt: true });
export type InsertNomina = z.infer<typeof insertNominaSchema>;
export type Nomina = typeof nominaTable.$inferSelect;
