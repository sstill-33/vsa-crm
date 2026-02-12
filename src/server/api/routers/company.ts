import { z } from "zod";
import { eq, and, or, ilike, desc, asc, isNull, isNotNull, lt, lte, notInArray } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  companies,
  activities,
  pipelineStages,
} from "~/server/db/schema";
import { parseRevenue } from "~/lib/utils";

const stageSchema = z.string().min(1).max(255);
const categorySchema = z.string().min(1).max(255);
const prioritySchema = z.string().min(1).max(255);
const ndaSchema = z.string().min(1).max(255);
const regionSchema = z.string().min(1).max(255);
const bracketSchema = z.string().min(1).max(255);

const companyCreateSchema = z.object({
  companyName: z.string().min(1).max(255),
  pipelineStage: stageSchema.default("Identified"),
  category: categorySchema,
  specialty: z.string().max(500).nullable().optional(),
  ndaStatus: ndaSchema.default("N/A"),
  location: z.string().max(255).nullable().optional(),
  region: regionSchema.nullable().optional(),
  estimatedRevenue: z.string().max(100).nullable().optional(),
  revenueBracket: bracketSchema.default("TBD"),
  website: z.string().max(500).nullable().optional(),
  priority: prioritySchema.default("Medium"),
  primaryContactName: z.string().max(255).nullable().optional(),
  primaryContactTitle: z.string().max(255).nullable().optional(),
  primaryContactEmail: z
    .string()
    .email()
    .max(255)
    .nullable()
    .optional()
    .or(z.literal("")),
  primaryContactPhone: z.string().max(50).nullable().optional(),
  askingPrice: z.string().max(100).nullable().optional(),
  estimatedEbitda: z.string().max(100).nullable().optional(),
  employeeCount: z.number().int().nullable().optional(),
  yearFounded: z.number().int().nullable().optional(),
  ownershipType: z.string().max(100).nullable().optional(),
  strategicFitNotes: z.string().nullable().optional(),
  synergyNotes: z.string().nullable().optional(),
  assignedTo: z.string().max(255).nullable().optional(),
  source: z.string().max(255).nullable().optional(),
  tags: z.string().nullable().optional(),
  lastContactDate: z.date().nullable().optional(),
  nextFollowUpDate: z.date().nullable().optional(),
});

const companyUpdateSchema = z.object({
  id: z.number(),
  companyName: z.string().min(1).max(255).optional(),
  pipelineStage: stageSchema.optional(),
  category: categorySchema.optional(),
  specialty: z.string().max(500).nullable().optional(),
  ndaStatus: ndaSchema.optional(),
  location: z.string().max(255).nullable().optional(),
  region: regionSchema.nullable().optional(),
  estimatedRevenue: z.string().max(100).nullable().optional(),
  revenueBracket: bracketSchema.optional(),
  website: z.string().max(500).nullable().optional(),
  priority: prioritySchema.optional(),
  primaryContactName: z.string().max(255).nullable().optional(),
  primaryContactTitle: z.string().max(255).nullable().optional(),
  primaryContactEmail: z
    .string()
    .email()
    .max(255)
    .nullable()
    .optional()
    .or(z.literal("")),
  primaryContactPhone: z.string().max(50).nullable().optional(),
  askingPrice: z.string().max(100).nullable().optional(),
  estimatedEbitda: z.string().max(100).nullable().optional(),
  employeeCount: z.number().int().nullable().optional(),
  yearFounded: z.number().int().nullable().optional(),
  ownershipType: z.string().max(100).nullable().optional(),
  strategicFitNotes: z.string().nullable().optional(),
  synergyNotes: z.string().nullable().optional(),
  assignedTo: z.string().max(255).nullable().optional(),
  source: z.string().max(255).nullable().optional(),
  tags: z.string().nullable().optional(),
  lastContactDate: z.date().nullable().optional(),
  nextFollowUpDate: z.date().nullable().optional(),
  stageChangeNote: z.string().optional(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sortableColumns: Record<string, any> = {
  companyName: companies.companyName,
  pipelineStage: companies.pipelineStage,
  category: companies.category,
  location: companies.location,
  estimatedRevenue: companies.estimatedRevenue,
  ndaStatus: companies.ndaStatus,
  priority: companies.priority,
  lastContactDate: companies.lastContactDate,
  nextFollowUpDate: companies.nextFollowUpDate,
  createdAt: companies.createdAt,
};

export const companyRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z
        .object({
          stage: stageSchema.optional(),
          category: categorySchema.optional(),
          region: regionSchema.optional(),
          revenueBracket: bracketSchema.optional(),
          ndaStatus: ndaSchema.optional(),
          priority: prioritySchema.optional(),
          search: z.string().optional(),
          sortBy: z.string().default("companyName"),
          sortOrder: z.enum(["asc", "desc"]).default("asc"),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];

      if (input?.stage)
        conditions.push(eq(companies.pipelineStage, input.stage));
      if (input?.category)
        conditions.push(eq(companies.category, input.category));
      if (input?.region) conditions.push(eq(companies.region, input.region));
      if (input?.revenueBracket)
        conditions.push(eq(companies.revenueBracket, input.revenueBracket));
      if (input?.ndaStatus)
        conditions.push(eq(companies.ndaStatus, input.ndaStatus));
      if (input?.priority)
        conditions.push(eq(companies.priority, input.priority));
      if (input?.search) {
        conditions.push(
          or(
            ilike(companies.companyName, `%${input.search}%`),
            ilike(companies.specialty, `%${input.search}%`),
            ilike(companies.location, `%${input.search}%`),
          )!,
        );
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const sortColumn =
        sortableColumns[input?.sortBy ?? "companyName"] ?? companies.companyName;
      const orderFn = input?.sortOrder === "desc" ? desc : asc;

      const results = await ctx.db
        .select()
        .from(companies)
        .where(where)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        .orderBy(orderFn(sortColumn));

      const now = new Date();
      return results.map((company) => {
        const daysSinceLastContact = company.lastContactDate
          ? Math.floor(
              (now.getTime() - company.lastContactDate.getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : null;
        const isOverdue =
          company.pipelineStage === "Talking" &&
          daysSinceLastContact !== null &&
          daysSinceLastContact > 30;
        return { ...company, daysSinceLastContact, isOverdue };
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const company = await ctx.db.query.companies.findFirst({
        where: eq(companies.id, input.id),
        with: {
          activities: { orderBy: [desc(activities.createdAt)] },
          documents: true,
        },
      });
      return company ?? null;
    }),

  create: publicProcedure
    .input(companyCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const [created] = await ctx.db
        .insert(companies)
        .values(input)
        .returning();
      return created;
    }),

  update: publicProcedure
    .input(companyUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, stageChangeNote, ...data } = input;

      if (data.pipelineStage) {
        const current = await ctx.db.query.companies.findFirst({
          where: eq(companies.id, id),
        });

        if (current && current.pipelineStage !== data.pipelineStage) {
          await ctx.db.insert(activities).values({
            companyId: id,
            activityType: "stage_change",
            title: `Stage changed from ${current.pipelineStage} to ${data.pipelineStage}`,
            description: stageChangeNote ?? undefined,
            createdAt: new Date(),
          });
          (data as Record<string, unknown>).stageChangedAt = new Date();

          if (
            data.pipelineStage === "NDA Signed" &&
            current.ndaStatus !== "Yes"
          ) {
            (data as Record<string, unknown>).ndaStatus = "Yes";
          }
        }
      }

      const [updated] = await ctx.db
        .update(companies)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(companies.id, id))
        .returning();

      return updated;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(companies).where(eq(companies.id, input.id));
      return { success: true };
    }),

  getStats: publicProcedure.query(async ({ ctx }) => {
    const allCompanies = await ctx.db.select().from(companies);
    const allStages = await ctx.db
      .select()
      .from(pipelineStages)
      .orderBy(asc(pipelineStages.displayOrder));

    const totalTargets = allCompanies.length;

    const activeStageNames = new Set(
      allStages.filter((s) => s.isActive).map((s) => s.name),
    );
    const closedStageNames = new Set(
      allStages.filter((s) => s.isClosed).map((s) => s.name),
    );
    const activeCompanies = allCompanies.filter((c) =>
      activeStageNames.has(c.pipelineStage),
    );
    const activeDiscussions = activeCompanies.length;
    const talkingCount = allCompanies.filter(
      (c) => c.pipelineStage === "Talking",
    ).length;

    let pipelineValue = 0;
    for (const c of allCompanies.filter(
      (co) => !closedStageNames.has(co.pipelineStage),
    )) {
      const parsed = parseRevenue(c.estimatedRevenue);
      if (parsed) pipelineValue += parsed.mid;
    }

    const talkingCompanies = allCompanies.filter(
      (c) => c.pipelineStage === "Talking",
    );
    const ndaYesCount = talkingCompanies.filter(
      (c) => c.ndaStatus === "Yes",
    ).length;
    const ndaCoverage =
      talkingCompanies.length > 0
        ? Math.round((ndaYesCount / talkingCompanies.length) * 100)
        : 0;

    const stageBreakdown = allStages.map((stage) => ({
      stage: stage.name,
      count: allCompanies.filter((c) => c.pipelineStage === stage.name).length,
    })).filter((s) => s.count > 0);

    const categoryMap = new Map<string, number>();
    for (const c of allCompanies) {
      categoryMap.set(c.category, (categoryMap.get(c.category) ?? 0) + 1);
    }
    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    const regionMap = new Map<string, number>();
    for (const c of allCompanies) {
      const region = c.region ?? "Unknown";
      regionMap.set(region, (regionMap.get(region) ?? 0) + 1);
    }
    const regionBreakdown = Array.from(regionMap.entries())
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count);

    const revenueMap = new Map<string, number>();
    for (const c of allCompanies) {
      const bracket = c.revenueBracket ?? "TBD";
      revenueMap.set(bracket, (revenueMap.get(bracket) ?? 0) + 1);
    }
    const revenueBreakdown = Array.from(revenueMap.entries()).map(
      ([bracket, count]) => ({ bracket, count }),
    );

    return {
      totalTargets,
      activeDiscussions,
      talkingCount,
      pipelineValue,
      ndaCoverage,
      stageBreakdown,
      categoryBreakdown,
      regionBreakdown,
      revenueBreakdown,
    };
  }),

  bulkUpdateStage: publicProcedure
    .input(
      z.object({
        ids: z.array(z.number()),
        stage: stageSchema,
        note: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      for (const id of input.ids) {
        const current = await ctx.db.query.companies.findFirst({
          where: eq(companies.id, id),
        });
        if (!current) continue;

        if (current.pipelineStage !== input.stage) {
          await ctx.db.insert(activities).values({
            companyId: id,
            activityType: "stage_change",
            title: `Stage changed from ${current.pipelineStage} to ${input.stage}`,
            description: input.note ?? undefined,
          });
        }

        await ctx.db
          .update(companies)
          .set({
            pipelineStage: input.stage,
            stageChangedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(companies.id, id));
      }
      return { success: true, count: input.ids.length };
    }),

  getDueSoonFollowUps: publicProcedure.query(async ({ ctx }) => {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Dynamically look up closed stages
    const closedStages = await ctx.db
      .select({ name: pipelineStages.name })
      .from(pipelineStages)
      .where(eq(pipelineStages.isClosed, true));
    const closedNames = closedStages.map((s) => s.name);

    return ctx.db
      .select()
      .from(companies)
      .where(
        and(
          isNotNull(companies.nextFollowUpDate),
          lte(companies.nextFollowUpDate, sevenDaysFromNow),
          closedNames.length > 0
            ? notInArray(companies.pipelineStage, closedNames)
            : undefined,
        ),
      )
      .orderBy(asc(companies.nextFollowUpDate));
  }),

  getStaleDeals: publicProcedure.query(async ({ ctx }) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return ctx.db
      .select()
      .from(companies)
      .where(
        and(
          eq(companies.pipelineStage, "Talking"),
          or(
            lt(companies.lastContactDate, thirtyDaysAgo),
            isNull(companies.lastContactDate),
          ),
        ),
      );
  }),
});
