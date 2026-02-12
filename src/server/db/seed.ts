import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  companies,
  activities,
  documents,
  pipelineStages,
  categories,
  priorities,
  ndaStatuses,
  regions,
  revenueBrackets,
} from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(connectionString);
const db = drizzle(client);

// ── Lookup table seed data ──────────────────────────────────────────────────────

const seedCategories: (typeof categories.$inferInsert)[] = [
  { name: "PMA/STC Mfg.", displayOrder: 0, colorHex: "#3b82f6", isSystem: false },
  { name: "OEM / PMA/STC Mfg.", displayOrder: 1, colorHex: "#6366f1", isSystem: false },
  { name: "Distributor", displayOrder: 2, colorHex: "#f59e0b", isSystem: false },
  { name: "Distributor/PMA Mfg.", displayOrder: 3, colorHex: "#f97316", isSystem: false },
  { name: "Repair Station", displayOrder: 4, colorHex: "#10b981", isSystem: false },
  { name: "STC", displayOrder: 5, colorHex: "#8b5cf6", isSystem: false },
  { name: "MRO", displayOrder: 6, colorHex: "#ec4899", isSystem: false },
  { name: "OEM", displayOrder: 7, colorHex: "#06b6d4", isSystem: false },
  { name: "Other", displayOrder: 8, colorHex: "#6b7280", isSystem: false },
];

const seedPriorities: (typeof priorities.$inferInsert)[] = [
  { name: "High", displayOrder: 0, colorBg: "bg-red-50", colorText: "text-red-700", colorDot: "bg-red-500", isSystem: false },
  { name: "Medium", displayOrder: 1, colorBg: "bg-amber-50", colorText: "text-amber-700", colorDot: "bg-amber-500", isSystem: false },
  { name: "Low", displayOrder: 2, colorBg: "bg-emerald-50", colorText: "text-emerald-700", colorDot: "bg-emerald-500", isSystem: false },
];

const seedNdaStatuses: (typeof ndaStatuses.$inferInsert)[] = [
  { name: "Yes", displayOrder: 0, colorBg: "bg-emerald-50", colorText: "text-emerald-700", isSystem: false },
  { name: "No", displayOrder: 1, colorBg: "bg-red-50", colorText: "text-red-700", isSystem: false },
  { name: "Pending", displayOrder: 2, colorBg: "bg-amber-50", colorText: "text-amber-700", isSystem: false },
  { name: "N/A", displayOrder: 3, colorBg: "bg-slate-50", colorText: "text-slate-500", isSystem: false },
];

const seedRegions: (typeof regions.$inferInsert)[] = [
  { name: "Midwest", displayOrder: 0, isSystem: false },
  { name: "West", displayOrder: 1, isSystem: false },
  { name: "South", displayOrder: 2, isSystem: false },
  { name: "Northeast", displayOrder: 3, isSystem: false },
  { name: "International", displayOrder: 4, isSystem: false },
];

const seedRevenueBrackets: (typeof revenueBrackets.$inferInsert)[] = [
  { name: "<$1M", displayOrder: 0, sortValue: 500000, isSystem: false },
  { name: "$1M-$3M", displayOrder: 1, sortValue: 2000000, isSystem: false },
  { name: "$3M-$5M", displayOrder: 2, sortValue: 4000000, isSystem: false },
  { name: "$5M-$10M", displayOrder: 3, sortValue: 7500000, isSystem: false },
  { name: "$10M-$25M", displayOrder: 4, sortValue: 17500000, isSystem: false },
  { name: "$25M-$50M", displayOrder: 5, sortValue: 37500000, isSystem: false },
  { name: "$50M-$100M", displayOrder: 6, sortValue: 75000000, isSystem: false },
  { name: "$100M+", displayOrder: 7, sortValue: 150000000, isSystem: false },
  { name: "TBD", displayOrder: 8, sortValue: 0, isSystem: false },
];

// ── Company seed data ──────────────────────────────────────────────────────────

type NewCompany = typeof companies.$inferInsert;

const seedCompanies: NewCompany[] = [
  {
    companyName: "AeroTwin, Inc",
    pipelineStage: "Talking",
    category: "PMA/STC Mfg.",
    specialty: "Cessna Modifications",
    ndaStatus: "Yes",
    location: "Anchorage, AK",
    region: "West",
    estimatedRevenue: "$2M - $3M",
    revenueBracket: "$1M-$3M",
    website: "https://www.aerotwin.com",
    priority: "Medium",
  },
  {
    companyName: "Steve's Aircraft",
    pipelineStage: "Talking",
    category: "PMA/STC Mfg.",
    specialty: "Fuel Strainers / Gascolators",
    ndaStatus: "No",
    location: "White City, OR",
    region: "West",
    estimatedRevenue: "$2M - $3M",
    revenueBracket: "$1M-$3M",
    website: "https://www.stevesaircraft.com",
    priority: "Medium",
  },
  {
    companyName: "Aviation Enterprise LLC",
    pipelineStage: "Talking",
    category: "PMA/STC Mfg.",
    specialty: "Jet Parts & Components",
    ndaStatus: "Yes",
    location: "Newnan, GA",
    region: "South",
    estimatedRevenue: "$4M - $6M",
    revenueBracket: "$5M-$10M",
    website: "https://www.aelparts.com",
    priority: "Medium",
  },
  {
    companyName: "Lear Chemical",
    pipelineStage: "Talking",
    category: "PMA/STC Mfg.",
    specialty: "Anti-corrosion Lubricants",
    ndaStatus: "Yes",
    location: "Ontario, Canada",
    region: "International",
    estimatedRevenue: "TBD",
    revenueBracket: "TBD",
    website: "https://www.learchem.com",
    priority: "Medium",
  },
  {
    companyName: "Knots 2U",
    pipelineStage: "Talking",
    category: "PMA/STC Mfg.",
    specialty: "Plastics",
    ndaStatus: "Yes",
    location: "Burlington, WI",
    region: "Midwest",
    estimatedRevenue: "$7M - $8M",
    revenueBracket: "$5M-$10M",
    website: "https://www.knots2u.net",
    priority: "Medium",
  },
  {
    companyName: "Kenmore",
    pipelineStage: "Talking",
    category: "PMA/STC Mfg.",
    specialty: "Airframe Parts",
    ndaStatus: "No",
    location: "Seattle, WA",
    region: "West",
    estimatedRevenue: "$5M",
    revenueBracket: "$5M-$10M",
    website: "https://www.kenmoreairharbor.com",
    priority: "Medium",
  },
  {
    companyName: "Coastal Air Strike",
    pipelineStage: "Talking",
    category: "PMA/STC Mfg.",
    specialty: "Airframe Parts",
    ndaStatus: "Yes",
    location: "Immokalee, FL",
    region: "South",
    estimatedRevenue: "$500K",
    revenueBracket: "<$1M",
    website: "https://www.coastalairstrike.com",
    priority: "Medium",
  },
  {
    companyName: "Aero Brakes",
    pipelineStage: "Talking",
    category: "PMA/STC Mfg.",
    specialty: "Airframe Parts",
    ndaStatus: "Yes",
    location: "Lago Vista, TX",
    region: "South",
    estimatedRevenue: "$5M",
    revenueBracket: "$5M-$10M",
    website: "https://www.aerobrake.com",
    priority: "Medium",
  },
  {
    companyName: "Mid Continent/Tru Blue",
    pipelineStage: "Talking",
    category: "OEM / PMA/STC Mfg.",
    specialty: "Batteries/Electronics",
    ndaStatus: "No",
    location: "Wichita, KS",
    region: "Midwest",
    estimatedRevenue: "$80M",
    revenueBracket: "$50M-$100M",
    website: "https://www.mcico.com",
    priority: "Medium",
  },
  {
    companyName: "Sporty",
    pipelineStage: "On the Horizon",
    category: "Distributor",
    specialty: "Aircraft Supplies",
    ndaStatus: "N/A",
    location: "Batavia, OH",
    region: "Midwest",
    estimatedRevenue: "$15M - $20M",
    revenueBracket: "$10M-$25M",
    website: "https://www.sportys.com",
    priority: "Medium",
  },
  {
    companyName: "Ralmark Company",
    pipelineStage: "On the Horizon",
    category: "OEM / PMA/STC Mfg.",
    specialty: "Pulleys",
    ndaStatus: "N/A",
    location: "Kingston, PA",
    region: "Northeast",
    estimatedRevenue: "$7M - $10M",
    revenueBracket: "$5M-$10M",
    website: "https://www.ralmark.com",
    priority: "Medium",
  },
  {
    companyName: "Univair",
    pipelineStage: "On the Horizon",
    category: "Distributor/PMA Mfg.",
    specialty: "General",
    ndaStatus: "N/A",
    location: "Aurora, CO",
    region: "West",
    estimatedRevenue: "$5M - $7M",
    revenueBracket: "$5M-$10M",
    website: "https://www.univair.com",
    priority: "Medium",
  },
  {
    companyName: "Aero-Classics",
    pipelineStage: "On the Horizon",
    category: "PMA/STC Mfg.",
    specialty: "Heat Transfer Products",
    ndaStatus: "N/A",
    location: "La Verne, CA",
    region: "West",
    estimatedRevenue: "$5M - $7M",
    revenueBracket: "$5M-$10M",
    website: "https://www.aero-classics.com",
    priority: "Medium",
  },
  {
    companyName: "Rapco",
    pipelineStage: "On the Horizon",
    category: "PMA/STC Mfg.",
    specialty: "Brakes, Pumps, Valves & Pneumatics",
    ndaStatus: "N/A",
    location: "Hartland, WI",
    region: "Midwest",
    estimatedRevenue: "$5M - $7M",
    revenueBracket: "$5M-$10M",
    website: "https://www.rapcoinc.com",
    priority: "Medium",
  },
  {
    companyName: "Weldon Pump",
    pipelineStage: "On the Horizon",
    category: "PMA/STC Mfg.",
    specialty: "Brakes & Valves",
    ndaStatus: "N/A",
    location: "Oakwood Village, OH",
    region: "Midwest",
    estimatedRevenue: "$17M - $22M",
    revenueBracket: "$10M-$25M",
    website: "https://www.weldonpumps.com",
    priority: "Medium",
  },
  {
    companyName: "Lee Aerospace",
    pipelineStage: "On the Horizon",
    category: "OEM / PMA/STC Mfg.",
    specialty: "Windshields and windows",
    ndaStatus: "N/A",
    location: "Wichita, KS",
    region: "Midwest",
    estimatedRevenue: "$25M",
    revenueBracket: "$25M-$50M",
    website: "https://www.leeaerospace.com",
    priority: "Medium",
  },
  {
    companyName: "Webco",
    pipelineStage: "On the Horizon",
    category: "PMA/STC Mfg.",
    specialty: "Piper PMA and Comanche repair station",
    ndaStatus: "N/A",
    location: "Newton, KS",
    region: "Midwest",
    estimatedRevenue: "$2M",
    revenueBracket: "$1M-$3M",
    website: "https://www.webcoaircraft.com",
    priority: "Medium",
  },
  {
    companyName: "JP Instruments",
    pipelineStage: "On the Horizon",
    category: "PMA/STC Mfg.",
    specialty: "Digital Displays",
    ndaStatus: "N/A",
    location: "Costa Mesa, CA",
    region: "West",
    estimatedRevenue: "$1M",
    revenueBracket: "$1M-$3M",
    website: "https://www.jpinstruments.com",
    priority: "Medium",
  },
  {
    companyName: "B&C Specialty",
    pipelineStage: "On the Horizon",
    category: "PMA/STC Mfg.",
    specialty: "Alternators/Lycoming Oil Filter Adapters",
    ndaStatus: "N/A",
    location: "Newton, KS",
    region: "Midwest",
    estimatedRevenue: "$1M",
    revenueBracket: "$1M-$3M",
    website: "https://www.bandc.com",
    priority: "Medium",
  },
  {
    companyName: "Texas Skyways",
    pipelineStage: "On the Horizon",
    category: "STC",
    specialty: "Engine STCs",
    ndaStatus: "N/A",
    location: "Boerne, TX",
    region: "South",
    estimatedRevenue: "$3M",
    revenueBracket: "$3M-$5M",
    website: "https://www.txskyways.com",
    priority: "Medium",
  },
  {
    companyName: "KS Avionics",
    pipelineStage: "On the Horizon",
    category: "PMA/STC Mfg.",
    specialty: "Sensors and probes",
    ndaStatus: "N/A",
    location: "N. Canton, OH",
    region: "Midwest",
    estimatedRevenue: "$4M",
    revenueBracket: "$3M-$5M",
    website: "https://www.ksavionics.com",
    priority: "Medium",
  },
  {
    companyName: "Approved Turbo Components",
    pipelineStage: "On the Horizon",
    category: "Repair Station",
    specialty: "Turbo Overhauler",
    ndaStatus: "N/A",
    location: "Vero Beach, FL",
    region: "South",
    estimatedRevenue: "$2M",
    revenueBracket: "$1M-$3M",
    website: "https://www.approvedturbo.com",
    priority: "Medium",
  },
  {
    companyName: "Mike's Fuel Metering",
    pipelineStage: "On the Horizon",
    category: "Repair Station",
    specialty: "Fuel systems overhauler",
    ndaStatus: "N/A",
    location: "Tulsa, OK",
    region: "South",
    estimatedRevenue: "TBD",
    revenueBracket: "TBD",
    website: null,
    priority: "Medium",
  },
  {
    companyName: "PowerFlow Systems",
    pipelineStage: "On the Horizon",
    category: "PMA/STC Mfg.",
    specialty: "Tuned Exhaust Systems",
    ndaStatus: "N/A",
    location: "Daytona Beach, FL",
    region: "South",
    estimatedRevenue: "$4M",
    revenueBracket: "$3M-$5M",
    website: "https://www.powerflowsystems.com",
    priority: "Medium",
  },
  {
    companyName: "Wilco",
    pipelineStage: "On the Horizon",
    category: "PMA/STC Mfg.",
    specialty: "Airframes",
    ndaStatus: "N/A",
    location: "Wichita, KS",
    region: "Midwest",
    estimatedRevenue: "$2M - $5M",
    revenueBracket: "$3M-$5M",
    website: "https://www.wilcoaircraftparts.com",
    priority: "Medium",
  },
];

const seedStages: (typeof pipelineStages.$inferInsert)[] = [
  { name: "Identified", displayOrder: 0, colorBg: "bg-slate-100", colorText: "text-slate-700", colorBorder: "border-slate-300", isSystem: false, isActive: false, isClosed: false },
  { name: "On the Horizon", displayOrder: 1, colorBg: "bg-sky-50", colorText: "text-sky-700", colorBorder: "border-sky-300", isSystem: false, isActive: false, isClosed: false },
  { name: "Initial Outreach", displayOrder: 2, colorBg: "bg-blue-50", colorText: "text-blue-700", colorBorder: "border-blue-300", isSystem: false, isActive: false, isClosed: false },
  { name: "Talking", displayOrder: 3, colorBg: "bg-indigo-50", colorText: "text-indigo-700", colorBorder: "border-indigo-300", isSystem: true, isActive: true, isClosed: false },
  { name: "NDA Signed", displayOrder: 4, colorBg: "bg-violet-50", colorText: "text-violet-700", colorBorder: "border-violet-300", isSystem: true, isActive: true, isClosed: false },
  { name: "Due Diligence", displayOrder: 5, colorBg: "bg-purple-50", colorText: "text-purple-700", colorBorder: "border-purple-300", isSystem: false, isActive: true, isClosed: false },
  { name: "LOI Submitted", displayOrder: 6, colorBg: "bg-fuchsia-50", colorText: "text-fuchsia-700", colorBorder: "border-fuchsia-300", isSystem: false, isActive: true, isClosed: false },
  { name: "Under Negotiation", displayOrder: 7, colorBg: "bg-amber-50", colorText: "text-amber-700", colorBorder: "border-amber-300", isSystem: false, isActive: true, isClosed: false },
  { name: "Closed - Won", displayOrder: 8, colorBg: "bg-emerald-50", colorText: "text-emerald-700", colorBorder: "border-emerald-300", isSystem: true, isActive: false, isClosed: true },
  { name: "Closed - Lost", displayOrder: 9, colorBg: "bg-red-50", colorText: "text-red-700", colorBorder: "border-red-300", isSystem: true, isActive: false, isClosed: true },
  { name: "On Hold", displayOrder: 10, colorBg: "bg-gray-100", colorText: "text-gray-600", colorBorder: "border-gray-300", isSystem: false, isActive: false, isClosed: false },
];

async function seed() {
  console.log("Seeding database...");

  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(documents);
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(activities);
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(companies);
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(pipelineStages);
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(categories);
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(priorities);
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(ndaStatuses);
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(regions);
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(revenueBrackets);

  // Seed lookup tables
  const insertedCategories = await db.insert(categories).values(seedCategories).returning();
  console.log(`Inserted ${insertedCategories.length} categories`);

  const insertedPriorities = await db.insert(priorities).values(seedPriorities).returning();
  console.log(`Inserted ${insertedPriorities.length} priorities`);

  const insertedNdaStatuses = await db.insert(ndaStatuses).values(seedNdaStatuses).returning();
  console.log(`Inserted ${insertedNdaStatuses.length} NDA statuses`);

  const insertedRegions = await db.insert(regions).values(seedRegions).returning();
  console.log(`Inserted ${insertedRegions.length} regions`);

  const insertedBrackets = await db.insert(revenueBrackets).values(seedRevenueBrackets).returning();
  console.log(`Inserted ${insertedBrackets.length} revenue brackets`);

  const insertedStages = await db.insert(pipelineStages).values(seedStages).returning();
  console.log(`Inserted ${insertedStages.length} pipeline stages`);

  const inserted = await db.insert(companies).values(seedCompanies).returning();
  console.log(`Inserted ${inserted.length} companies`);

  const talkingCompanies = inserted.filter(
    (c) => c.pipelineStage === "Talking",
  );

  for (const company of talkingCompanies) {
    await db.insert(activities).values({
      companyId: company.id,
      activityType: "note",
      title: "Initial contact logged",
      description: `Added ${company.companyName} to the acquisition pipeline.`,
      createdAt: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      ),
    });
  }

  console.log(`Inserted ${talkingCompanies.length} sample activities`);
  console.log("Seed complete!");
  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
