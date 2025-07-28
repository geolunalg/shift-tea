import { pgTable, timestamp, uuid, text, boolean, varchar, time, integer, date } from "drizzle-orm/pg-core";

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
    password: text("password").notNull(),
    isAdmin: boolean("is_admin").default(false),
    facilityId: uuid("facility_id")
        .notNull()
        .references(() => facilities.id, { onDelete: "restrict" }),
    deleteAt: timestamp("delete_at")
});

export type User = typeof users.$inferInsert;


export const refreshTokens = pgTable("refresh_tokens", {
    token: varchar("token", { length: 256 }).primaryKey(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    revokedAt: timestamp("revoked_at")
});

export type RefresToken = typeof refreshTokens.$inferInsert;


export const shifts = pgTable("shifts", {
    id: uuid("id").primaryKey().defaultRandom(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    month: integer("month").notNull(), // 1–12
    year: integer("year").notNull(),   // e.g., 2025
    facilityId: uuid("facility_id")
        .notNull()
        .references(() => facilities.id, { onDelete: "cascade" })
});

export type Shift = typeof shifts.$inferInsert;


export const scheduleDays = pgTable("schedule_days", {
    id: uuid("id").primaryKey().defaultRandom(),
    scheduleDate: date("schedule_date")
        .notNull()
        .unique()
});

export type ScheduleDay = typeof scheduleDays.$inferInsert;


export const assignments = pgTable("assignments", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    shiftId: uuid("shift_id")
        .notNull()
        .references(() => shifts.id, { onDelete: "cascade" }),
    scheduleDayId: uuid("schedule_day_id")
        .notNull()
        .references(() => scheduleDays.id, { onDelete: "cascade" })
});

export type Assignment = typeof assignments.$inferInsert;
