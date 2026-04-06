import { pgTable, serial, text, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const lotesTable = pgTable("lotes", {
  id: serial("id").primaryKey(),
  fincaId: integer("finca_id").notNull(),
  nombre: text("nombre").notNull(),
  hectareas: numeric("hectareas", { precision: 10, scale: 2 }).notNull(),
  cultivo: text("cultivo").notNull(),
  estado: text("estado").notNull().default("activo"),
});

export const insertLoteSchema = createInsertSchema(lotesTable).omit({ id: true });
export type InsertLote = z.infer<typeof insertLoteSchema>;
export type Lote = typeof lotesTable.$inferSelect;
