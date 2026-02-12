import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { documents } from "~/server/db/schema";

export const documentRouter = createTRPCRouter({
  getByCompanyId: publicProcedure
    .input(z.object({ companyId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(documents)
        .where(eq(documents.companyId, input.companyId));
    }),

  create: publicProcedure
    .input(
      z.object({
        companyId: z.number(),
        documentName: z.string().min(1).max(255),
        documentType: z.string().max(100).nullable().optional(),
        url: z.string().max(1000).nullable().optional(),
        notes: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [created] = await ctx.db
        .insert(documents)
        .values(input)
        .returning();
      return created;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(documents).where(eq(documents.id, input.id));
      return { success: true };
    }),
});
