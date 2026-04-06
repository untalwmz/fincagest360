import { pgTable, serial, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const fincasTable = pgTable("fincas", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  ubicacion: text("ubicacion").notNull(),
  hectareas: numeric("hectareas", { precision: 10, scale: 2 }).notNull(),
  cultivo: text("cultivo").notNull(),
  estado: text("estado").notNull().default("activa"),
  propietario: text("propietario"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFincaSchema = createInsertSchema(fincasTable).omit({ id: true, createdAt: true });
export type InsertFinca = z.infer<typeof insertFincaSchema>;
export type Finca = typeof fincasTable.$inferSelect;
