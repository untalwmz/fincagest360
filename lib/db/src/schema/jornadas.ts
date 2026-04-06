import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const jornadasTable = pgTable("jornadas", {
  id: serial("id").primaryKey(),
  empleadoId: integer("empleado_id").notNull(),
  fincaId: integer("finca_id").notNull(),
  fecha: text("fecha").notNull(),
  horasRegulares: numeric("horas_regulares", { precision: 5, scale: 2 }).notNull(),
  horasExtra: numeric("horas_extra", { precision: 5, scale: 2 }).default("0"),
  actividad: text("actividad").notNull(),
  notas: text("notas"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertJornadaSchema = createInsertSchema(jornadasTable).omit({ id: true, createdAt: true });
export type InsertJornada = z.infer<typeof insertJornadaSchema>;
export type Jornada = typeof jornadasTable.$inferSelect;
