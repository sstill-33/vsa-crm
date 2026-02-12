import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

// ── Lookup Tables ──────────────────────────────────────────────────────────────

export const pipelineStages = pgTable("pipeline_stages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  displayOrder: integer("display_order").notNull(),
  colorBg: varchar("color_bg", { length: 100 }).notNull(),
  colorText: varchar("color_text", { length: 100 }).notNull(),
  colorBorder: varchar("color_border", { length: 100 }).notNull(),
  isSystem: boolean("is_system").notNull().default(false),
  isActive: boolean("is_active").notNull().default(false),
  isClosed: boolean("is_closed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  displayOrder: integer("display_order").notNull(),
  colorHex: varchar("color_hex", { length: 20 }).notNull().default("#6b7280"),
  isSystem: boolean("is_system").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const priorities = pgTable("priorities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  displayOrder: integer("display_order").notNull(),
  colorBg: varchar("color_bg", { length: 100 }).notNull().default("bg-slate-50"),
  colorText: varchar("color_text", { length: 100 }).notNull().default("text-slate-600"),
  colorDot: varchar("color_dot", { length: 100 }).notNull().default("bg-slate-400"),
  isSystem: boolean("is_system").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ndaStatuses = pgTable("nda_statuses", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  displayOrder: integer("display_order").notNull(),
  colorBg: varchar("color_bg", { length: 100 }).notNull().default("bg-slate-50"),
  colorText: varchar("color_text", { length: 100 }).notNull().default("text-slate-500"),
  isSystem: boolean("is_system").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const regions = pgTable("regions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  displayOrder: integer("display_order").notNull(),
  isSystem: boolean("is_system").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const revenueBrackets = pgTable("revenue_brackets", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  displayOrder: integer("display_order").notNull(),
  sortValue: integer("sort_value").notNull().default(0),
  isSystem: boolean("is_system").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Main Tables ────────────────────────────────────────────────────────────────

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  pipelineStage: varchar("pipeline_stage", { length: 255 })
    .notNull()
    .default("Identified"),
  category: varchar("category", { length: 255 }).notNull(),
  specialty: varchar("specialty", { length: 500 }),
  ndaStatus: varchar("nda_status", { length: 255 }).notNull().default("N/A"),
  location: varchar("location", { length: 255 }),
  region: varchar("region", { length: 255 }),
  estimatedRevenue: varchar("estimated_revenue", { length: 100 }),
  revenueBracket: varchar("revenue_bracket", { length: 255 }).default("TBD"),
  website: varchar("website", { length: 500 }),
  priority: varchar("priority", { length: 255 }).default("Medium"),

  // Contact Info
  primaryContactName: varchar("primary_contact_name", { length: 255 }),
  primaryContactTitle: varchar("primary_contact_title", { length: 255 }),
  primaryContactEmail: varchar("primary_contact_email", { length: 255 }),
  primaryContactPhone: varchar("primary_contact_phone", { length: 50 }),

  // Deal Info
  askingPrice: varchar("asking_price", { length: 100 }),
  estimatedEbitda: varchar("estimated_ebitda", { length: 100 }),
  employeeCount: integer("employee_count"),
  yearFounded: integer("year_founded"),
  ownershipType: varchar("ownership_type", { length: 100 }),

  // Fit Assessment
  strategicFitNotes: text("strategic_fit_notes"),
  synergyNotes: text("synergy_notes"),

  // Internal tracking
  assignedTo: varchar("assigned_to", { length: 255 }),
  source: varchar("source", { length: 255 }),
  tags: text("tags"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastContactDate: timestamp("last_contact_date"),
  nextFollowUpDate: timestamp("next_follow_up_date"),
  stageChangedAt: timestamp("stage_changed_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  activityType: varchar("activity_type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  contactPerson: varchar("contact_person", { length: 255 }),
  outcome: varchar("outcome", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: varchar("created_by", { length: 255 }),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  documentName: varchar("document_name", { length: 255 }).notNull(),
  documentType: varchar("document_type", { length: 100 }),
  url: varchar("url", { length: 1000 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Relations ──────────────────────────────────────────────────────────────────

export const companiesRelations = relations(companies, ({ many }) => ({
  activities: many(activities),
  documents: many(documents),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  company: one(companies, {
    fields: [activities.companyId],
    references: [companies.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  company: one(companies, {
    fields: [documents.companyId],
    references: [companies.id],
  }),
}));
