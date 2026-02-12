import { z } from "zod";
import { eq, asc, sql, count } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  companies,
  categories,
  priorities,
  ndaStatuses,
  regions,
  revenueBrackets,
} from "~/server/db/schema";

const lookupTypeSchema = z.enum([
  "category",
  "priority",
  "ndaStatus",
  "region",
  "revenueBracket",
]);

type LookupType = z.infer<typeof lookupTypeSchema>;

function getTable(type: LookupType) {
  switch (type) {
    case "category":
      return categories;
    case "priority":
      return priorities;
    case "ndaStatus":
      return ndaStatuses;
    case "region":
      return regions;
    case "revenueBracket":
      return revenueBrackets;
  }
}

function getCompanyColumn(type: LookupType) {
  switch (type) {
    case "category":
      return companies.category;
    case "priority":
      return companies.priority;
    case "ndaStatus":
      return companies.ndaStatus;
    case "region":
      return companies.region;
    case "revenueBracket":
      return companies.revenueBracket;
  }
}

export const lookupRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ type: lookupTypeSchema }))
    .query(async ({ ctx, input }) => {
      const table = getTable(input.type);
      return ctx.db
        .select()
        .from(table)
        .orderBy(asc(table.displayOrder));
    }),

  create: publicProcedure
    .input(
      z.object({
        type: lookupTypeSchema,
        name: z.string().min(1).max(255),
        colorHex: z.string().max(20).optional(),
        colorBg: z.string().max(100).optional(),
        colorText: z.string().max(100).optional(),
        colorDot: z.string().max(100).optional(),
        sortValue: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const table = getTable(input.type);

      // Auto-assign next displayOrder
      const [maxRow] = await ctx.db
        .select({ max: sql<number>`COALESCE(MAX(${table.displayOrder}), -1)` })
        .from(table);
      const nextOrder = (maxRow?.max ?? -1) + 1;

      switch (input.type) {
        case "category": {
          const [created] = await ctx.db
            .insert(categories)
            .values({
              name: input.name,
              displayOrder: nextOrder,
              colorHex: input.colorHex ?? "#6b7280",
            })
            .returning();
          return created;
        }
        case "priority": {
          const [created] = await ctx.db
            .insert(priorities)
            .values({
              name: input.name,
              displayOrder: nextOrder,
              colorBg: input.colorBg ?? "bg-slate-50",
              colorText: input.colorText ?? "text-slate-600",
              colorDot: input.colorDot ?? "bg-slate-400",
            })
            .returning();
          return created;
        }
        case "ndaStatus": {
          const [created] = await ctx.db
            .insert(ndaStatuses)
            .values({
              name: input.name,
              displayOrder: nextOrder,
              colorBg: input.colorBg ?? "bg-slate-50",
              colorText: input.colorText ?? "text-slate-500",
            })
            .returning();
          return created;
        }
        case "region": {
          const [created] = await ctx.db
            .insert(regions)
            .values({
              name: input.name,
              displayOrder: nextOrder,
            })
            .returning();
          return created;
        }
        case "revenueBracket": {
          const [created] = await ctx.db
            .insert(revenueBrackets)
            .values({
              name: input.name,
              displayOrder: nextOrder,
              sortValue: input.sortValue ?? 0,
            })
            .returning();
          return created;
        }
      }
    }),

  rename: publicProcedure
    .input(
      z.object({
        type: lookupTypeSchema,
        id: z.number(),
        newName: z.string().min(1).max(255),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const table = getTable(input.type);
      const companyCol = getCompanyColumn(input.type);

      // Get old name
      const [existing] = await ctx.db
        .select()
        .from(table)
        .where(eq(table.id, input.id));

      if (!existing) throw new Error("Item not found");

      const oldName = existing.name;

      // Update lookup table
      const [updated] = await ctx.db
        .update(table)
        .set({ name: input.newName })
        .where(eq(table.id, input.id))
        .returning();

      // Cascade: update all companies using old name
      await ctx.db
        .update(companies)
        .set({ [companyCol.name]: input.newName } as Record<string, string>)
        .where(eq(companyCol, oldName));

      return updated;
    }),

  updateColor: publicProcedure
    .input(
      z.object({
        type: lookupTypeSchema,
        id: z.number(),
        colorHex: z.string().max(20).optional(),
        colorBg: z.string().max(100).optional(),
        colorText: z.string().max(100).optional(),
        colorDot: z.string().max(100).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      switch (input.type) {
        case "category": {
          const [updated] = await ctx.db
            .update(categories)
            .set({ colorHex: input.colorHex ?? "#6b7280" })
            .where(eq(categories.id, input.id))
            .returning();
          return updated;
        }
        case "priority": {
          const updates: Record<string, string> = {};
          if (input.colorBg) updates.colorBg = input.colorBg;
          if (input.colorText) updates.colorText = input.colorText;
          if (input.colorDot) updates.colorDot = input.colorDot;
          const [updated] = await ctx.db
            .update(priorities)
            .set(updates)
            .where(eq(priorities.id, input.id))
            .returning();
          return updated;
        }
        case "ndaStatus": {
          const updates: Record<string, string> = {};
          if (input.colorBg) updates.colorBg = input.colorBg;
          if (input.colorText) updates.colorText = input.colorText;
          const [updated] = await ctx.db
            .update(ndaStatuses)
            .set(updates)
            .where(eq(ndaStatuses.id, input.id))
            .returning();
          return updated;
        }
        default:
          throw new Error("This lookup type does not support colors");
      }
    }),

  reorder: publicProcedure
    .input(
      z.object({
        type: lookupTypeSchema,
        items: z.array(
          z.object({
            id: z.number(),
            displayOrder: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const table = getTable(input.type);
      for (const item of input.items) {
        await ctx.db
          .update(table)
          .set({ displayOrder: item.displayOrder })
          .where(eq(table.id, item.id));
      }
      return { success: true };
    }),

  getUsageCount: publicProcedure
    .input(
      z.object({
        type: lookupTypeSchema,
        id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const table = getTable(input.type);
      const companyCol = getCompanyColumn(input.type);

      // Get the name for this lookup id
      const [item] = await ctx.db
        .select()
        .from(table)
        .where(eq(table.id, input.id));

      if (!item) return { count: 0 };

      const [result] = await ctx.db
        .select({ count: count() })
        .from(companies)
        .where(eq(companyCol, item.name));

      return { count: result?.count ?? 0 };
    }),

  delete: publicProcedure
    .input(
      z.object({
        type: lookupTypeSchema,
        id: z.number(),
        reassignTo: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const table = getTable(input.type);
      const companyCol = getCompanyColumn(input.type);

      // Get the name for this lookup id
      const [item] = await ctx.db
        .select()
        .from(table)
        .where(eq(table.id, input.id));

      if (!item) throw new Error("Item not found");

      // Check for companies using this value
      const [usageResult] = await ctx.db
        .select({ count: count() })
        .from(companies)
        .where(eq(companyCol, item.name));

      const usageCount = usageResult?.count ?? 0;

      if (usageCount > 0) {
        if (!input.reassignTo) {
          throw new Error(
            `Cannot delete: ${usageCount} companies use this value. Provide reassignTo.`,
          );
        }

        // Reassign companies
        await ctx.db
          .update(companies)
          .set({ [companyCol.name]: input.reassignTo } as Record<string, string>)
          .where(eq(companyCol, item.name));
      }

      // Delete the lookup value
      await ctx.db.delete(table).where(eq(table.id, input.id));

      return { success: true };
    }),
});
