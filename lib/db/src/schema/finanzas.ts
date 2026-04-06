import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ingresosTable = pgTable("ingresos", {
  id: serial("id").primaryKey(),
  fincaId: integer("finca_id"),
  concepto: text("concepto").notNull(),
  monto: numeric("monto", { precision: 14, scale: 2 }).notNull(),
  fecha: text("fecha").notNull(),
  categoria: text("categoria").notNull(),
  notas: text("notas"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gastosTable = pgTable("gastos", {
  id: serial("id").primaryKey(),
  fincaId: integer("finca_id"),
  concepto: text("concepto").notNull(),
  monto: numeric("monto", { precision: 14, scale: 2 }).notNull(),
  fecha: text("fecha").notNull(),
  categoria: text("categoria").notNull(),
  notas: text("notas"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inversionesTable = pgTable("inversiones", {
  id: serial("id").primaryKey(),
  fincaId: integer("finca_id"),
  descripcion: text("descripcion").notNull(),
  monto: numeric("monto", { precision: 14, scale: 2 }).notNull(),
  fecha: text("fecha").notNull(),
  tipo: text("tipo").notNull(),
  retornoEsperado: numeric("retorno_esperado", { precision: 14, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertIngresoSchema = createInsertSchema(ingresosTable).omit({ id: true, createdAt: true });
export const insertGastoSchema = createInsertSchema(gastosTable).omit({ id: true, createdAt: true });
export const insertInversionSchema = createInsertSchema(inversionesTable).omit({ id: true, createdAt: true });

export type InsertIngreso = z.infer<typeof insertIngresoSchema>;
export type Ingreso = typeof ingresosTable.$inferSelect;
export type InsertGasto = z.infer<typeof insertGastoSchema>;
export type Gasto = typeof gastosTable.$inferSelect;
export type InsertInversion = z.infer<typeof insertInversionSchema>;
export type Inversion = typeof inversionesTable.$inferSelect;
