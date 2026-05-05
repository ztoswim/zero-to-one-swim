import { pgTable, uuid, text, timestamp, integer, decimal, date, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // Linked to auth.users.id
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  phone: text("phone"),
  role: text("role", { enum: ["admin", "coach", "parent"] }).notNull().default("parent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const coaches = pgTable("coaches", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  nickname: text("nickname"),
  gender: text("gender"),
  ic: text("ic"),
  phone: text("phone"),
  email: text("email"),
  color: text("color").default("#3b82f6"),
  cost: decimal("cost", { precision: 10, scale: 2 }).default("50.00"),
  bankName: text("bank_name"),
  bankAccount: text("bank_account"),
  emergencyName: text("emergency_name"),
  emergencyPhone: text("emergency_phone"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const students = pgTable("students", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  parentName: text("parent_name"),
  gender: text("gender"),
  dob: date("dob"),
  address: text("address"),
  sameArea: text("same_area"),
  emergencyName: text("emergency_name"),
  emergencyPhone: text("emergency_phone"),
  venueInfo: text("venue_info"),
  notes: text("notes"),
  coachId: uuid("coach_id").references(() => coaches.id),
  status: text("status").default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const packages = pgTable("packages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  lessonCount: integer("lesson_count").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  type: text("type"),
  duration: integer("duration").default(45),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  studentId: uuid("student_id").references(() => students.id, { onDelete: "cascade" }),
  packageId: uuid("package_id").references(() => packages.id),
  coachId: uuid("coach_id").references(() => coaches.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  paymentMethod: text("payment_method"),
  paymentDate: date("payment_date"),
  lessonsRemaining: integer("lessons_remaining").notNull(),
  status: text("status").default("paid"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const lessons = pgTable("lessons", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").references(() => students.id, { onDelete: "cascade" }),
  invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "cascade" }),
  coachId: uuid("coach_id").references(() => coaches.id),
  date: date("date").notNull(),
  time: text("time").notNull(),
  duration: integer("duration").notNull(),
  status: text("status").default("scheduled"),
  remark: text("remark"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Relations
export const coachesRelations = relations(coaches, ({ many }) => ({
  students: many(students),
  lessons: many(lessons),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  coach: one(coaches, {
    fields: [students.coachId],
    references: [coaches.id],
  }),
  invoices: many(invoices),
  lessons: many(lessons),
}));

export const packagesRelations = relations(packages, ({ many }) => ({
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  student: one(students, {
    fields: [invoices.studentId],
    references: [students.id],
  }),
  package: one(packages, {
    fields: [invoices.packageId],
    references: [packages.id],
  }),
  coach: one(coaches, {
    fields: [invoices.coachId],
    references: [coaches.id],
  }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one }) => ({
  student: one(students, {
    fields: [lessons.studentId],
    references: [students.id],
  }),
  invoice: one(invoices, {
    fields: [lessons.invoiceId],
    references: [invoices.id],
  }),
  coach: one(coaches, {
    fields: [lessons.coachId],
    references: [coaches.id],
  }),
}));
