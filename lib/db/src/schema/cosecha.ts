import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cosechaTable = pgTable("cosecha", {
  id: serial("id").primaryKey(),
  fincaId: integer("finca_id").notNull(),
  loteId: integer("lote_id"),
  fecha: text("fecha").notNull(),
  cultivo: text("cultivo").notNull(),
  cantidadKg: numeric("cantidad_kg", { precision: 12, scale: 2 }).notNull(),
  calidad: text("calidad").notNull(),
  responsable: text("responsable"),
  precioVenta: numeric("precio_venta", { precision: 12, scale: 2 }),
  comprador: text("comprador"),
  notas: text("notas"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCosechaSchema = createInsertSchema(cosechaTable).omit({ id: true, createdAt: true });
export type InsertCosecha = z.infer<typeof insertCosechaSchema>;
export type Cosecha = typeof cosechaTable.$inferSelect;
