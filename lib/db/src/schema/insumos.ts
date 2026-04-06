import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const insumosTable = pgTable("insumos", {
  id: serial("id").primaryKey(),
  fincaId: integer("finca_id"),
  nombre: text("nombre").notNull(),
  tipo: text("tipo").notNull(),
  cantidad: numeric("cantidad", { precision: 12, scale: 2 }).notNull(),
  unidad: text("unidad").notNull(),
  costoUnitario: numeric("costo_unitario", { precision: 12, scale: 2 }).notNull(),
  proveedor: text("proveedor"),
  fechaCompra: text("fecha_compra"),
  stockMinimo: numeric("stock_minimo", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInsumoSchema = createInsertSchema(insumosTable).omit({ id: true, createdAt: true });
export type InsertInsumo = z.infer<typeof insertInsumoSchema>;
export type Insumo = typeof insumosTable.$inferSelect;
