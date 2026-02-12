import { companyRouter } from "~/server/api/routers/company";
import { activityRouter } from "~/server/api/routers/activity";
import { documentRouter } from "~/server/api/routers/document";
import { stageRouter } from "~/server/api/routers/stage";
import { lookupRouter } from "~/server/api/routers/lookup";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  company: companyRouter,
  activity: activityRouter,
  document: documentRouter,
  stage: stageRouter,
  lookup: lookupRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
