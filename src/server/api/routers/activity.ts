import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { activities, companies } from "~/server/db/schema";

export const activityRouter = createTRPCRouter({
  getByCompanyId: publicProcedure
    .input(z.object({ companyId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(activities)
        .where(eq(activities.companyId, input.companyId))
        .orderBy(desc(activities.createdAt));
    }),

  create: publicProcedure
    .input(
      z.object({
        companyId: z.number(),
        activityType: z.string().min(1).max(50),
        title: z.string().min(1).max(255),
        description: z.string().nullable().optional(),
        contactPerson: z.string().max(255).nullable().optional(),
        outcome: z.string().max(255).nullable().optional(),
        createdBy: z.string().max(255).nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [created] = await ctx.db
        .insert(activities)
        .values(input)
        .returning();

      await ctx.db
        .update(companies)
        .set({ lastContactDate: new Date(), updatedAt: new Date() })
        .where(eq(companies.id, input.companyId));

      return created;
    }),

  getRecent: publicProcedure
    .input(z.object({ limit: z.number().default(20) }).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      return ctx.db.query.activities.findMany({
        orderBy: [desc(activities.createdAt)],
        limit,
        with: { company: true },
      });
    }),
});
