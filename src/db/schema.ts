import { pgTable, timestamp, uuid, text, boolean, varchar } from "drizzle-orm/pg-core";

export const facilities = pgTable("facilities", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    facilityName: varchar("facility_name", { length: 256 }).unique().notNull(),
    deleteAt: timestamp("delete_at")
});

export type Facility = typeof facilities.$inferInsert;

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    firstName: varchar("first_name", { length: 256 }).notNull(),
    lastName: varchar("last_name", { length: 256 }).notNull(),
    email: varchar("email", { length: 256 }).unique().notNull(),
    passwordHash: text("password_hash").notNull(),
    isAdmin: boolean("is_admin").default(false),
    facilityId: uuid("facility_id")
        .notNull()
        .references(() => facilities.id, { onDelete: "restrict" }),
    deleteAt: timestamp("delete_at")
});

export type User = typeof users.$inferInsert;
