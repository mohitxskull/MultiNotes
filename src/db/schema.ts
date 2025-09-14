import {
  bigint,
  mysqlEnum,
  mysqlTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const tenants = mysqlTable("tenants", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  plan: mysqlEnum("plan", ["free", "pro"]).default("free").notNull(),
});

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["admin", "member"]).default("member").notNull(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
});

export const notes = mysqlTable("notes", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  authorId: bigint("author_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  notes: many(notes),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  notes: many(notes),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  tenant: one(tenants, {
    fields: [notes.tenantId],
    references: [tenants.id],
  }),
  author: one(users, {
    fields: [notes.authorId],
    references: [users.id],
  }),
}));