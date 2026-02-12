import { z } from "zod";
import { eq, asc, sql } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { pipelineStages, companies } from "~/server/db/schema";

export const stageRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(pipelineStages)
      .orderBy(asc(pipelineStages.displayOrder));
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        colorBg: z.string().max(100),
        colorText: z.string().max(100),
        colorBorder: z.string().max(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Auto-assign next displayOrder
      const [maxRow] = await ctx.db
        .select({ max: sql<number>`COALESCE(MAX(${pipelineStages.displayOrder}), -1)` })
        .from(pipelineStages);
      const nextOrder = (maxRow?.max ?? -1) + 1;

      const [created] = await ctx.db
        .insert(pipelineStages)
        .values({
          name: input.name,
          displayOrder: nextOrder,
          colorBg: input.colorBg,
          colorText: input.colorText,
          colorBorder: input.colorBorder,
          isSystem: false,
          isActive: false,
          isClosed: false,
        })
        .returning();

      return created;
    }),

  rename: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const stage = await ctx.db.query.pipelineStages.findFirst({
        where: eq(pipelineStages.id, input.id),
      });

      if (!stage) throw new Error("Stage not found");
      if (stage.isSystem) throw new Error("Cannot rename system stages");

      const oldName = stage.name;

      // Update stage name
      const [updated] = await ctx.db
        .update(pipelineStages)
        .set({ name: input.name })
        .where(eq(pipelineStages.id, input.id))
        .returning();

      // Cascade: update all companies using this stage
      await ctx.db
        .update(companies)
        .set({ pipelineStage: input.name })
        .where(eq(companies.pipelineStage, oldName));

      // Cascade: update activity titles that reference the old name
      await ctx.db.execute(
        sql`UPDATE activities SET title = REPLACE(title, ${oldName}, ${input.name}) WHERE activity_type = 'stage_change' AND title LIKE ${'%' + oldName + '%'}`,
      );

      return updated;
    }),

  updateColor: publicProcedure
    .input(
      z.object({
        id: z.number(),
        colorBg: z.string().max(100),
        colorText: z.string().max(100),
        colorBorder: z.string().max(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(pipelineStages)
        .set({
          colorBg: input.colorBg,
          colorText: input.colorText,
          colorBorder: input.colorBorder,
        })
        .where(eq(pipelineStages.id, input.id))
        .returning();

      return updated;
    }),

  reorder: publicProcedure
    .input(
      z.array(
        z.object({
          id: z.number(),
          displayOrder: z.number(),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      for (const item of input) {
        await ctx.db
          .update(pipelineStages)
          .set({ displayOrder: item.displayOrder })
          .where(eq(pipelineStages.id, item.id));
      }
      return { success: true };
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        moveToStageId: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const stage = await ctx.db.query.pipelineStages.findFirst({
        where: eq(pipelineStages.id, input.id),
      });

      if (!stage) throw new Error("Stage not found");
      if (stage.isSystem) throw new Error("Cannot delete system stages");

      // Check for companies using this stage
      const companiesInStage = await ctx.db
        .select()
        .from(companies)
        .where(eq(companies.pipelineStage, stage.name));

      if (companiesInStage.length > 0) {
        if (!input.moveToStageId) {
          throw new Error(
            `Cannot delete stage with ${companiesInStage.length} companies. Provide moveToStageId.`,
          );
        }

        const targetStage = await ctx.db.query.pipelineStages.findFirst({
          where: eq(pipelineStages.id, input.moveToStageId),
        });

        if (!targetStage) throw new Error("Target stage not found");

        await ctx.db
          .update(companies)
          .set({ pipelineStage: targetStage.name })
          .where(eq(companies.pipelineStage, stage.name));
      }

      await ctx.db
        .delete(pipelineStages)
        .where(eq(pipelineStages.id, input.id));

      return { success: true };
    }),
});
