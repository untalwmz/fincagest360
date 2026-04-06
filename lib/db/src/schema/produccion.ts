import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const produccionTable = pgTable("produccion", {
  id: serial("id").primaryKey(),
  fincaId: integer("finca_id").notNull(),
  loteId: integer("lote_id"),
  fecha: text("fecha").notNull(),
  cultivo: text("cultivo").notNull(),
  cantidadKg: numeric("cantidad_kg", { precision: 12, scale: 2 }).notNull(),
  valorUnitario: numeric("valor_unitario", { precision: 12, scale: 2 }).notNull(),
  notas: text("notas"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProduccionSchema = createInsertSchema(produccionTable).omit({ id: true, createdAt: true });
export type InsertProduccion = z.infer<typeof insertProduccionSchema>;
export type Produccion = typeof produccionTable.$inferSelect;
