CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"activity_type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"contact_person" varchar(255),
	"outcome" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"display_order" integer NOT NULL,
	"color_hex" varchar(20) DEFAULT '#6b7280' NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"pipeline_stage" varchar(255) DEFAULT 'Identified' NOT NULL,
	"category" varchar(255) NOT NULL,
	"specialty" varchar(500),
	"nda_status" varchar(255) DEFAULT 'N/A' NOT NULL,
	"location" varchar(255),
	"region" varchar(255),
	"estimated_revenue" varchar(100),
	"revenue_bracket" varchar(255) DEFAULT 'TBD',
	"website" varchar(500),
	"priority" varchar(255) DEFAULT 'Medium',
	"primary_contact_name" varchar(255),
	"primary_contact_title" varchar(255),
	"primary_contact_email" varchar(255),
	"primary_contact_phone" varchar(50),
	"asking_price" varchar(100),
	"estimated_ebitda" varchar(100),
	"employee_count" integer,
	"year_founded" integer,
	"ownership_type" varchar(100),
	"strategic_fit_notes" text,
	"synergy_notes" text,
	"assigned_to" varchar(255),
	"source" varchar(255),
	"tags" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_contact_date" timestamp,
	"next_follow_up_date" timestamp,
	"stage_changed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"document_name" varchar(255) NOT NULL,
	"document_type" varchar(100),
	"url" varchar(1000),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nda_statuses" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"display_order" integer NOT NULL,
	"color_bg" varchar(100) DEFAULT 'bg-slate-50' NOT NULL,
	"color_text" varchar(100) DEFAULT 'text-slate-500' NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "nda_statuses_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "pipeline_stages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"display_order" integer NOT NULL,
	"color_bg" varchar(100) NOT NULL,
	"color_text" varchar(100) NOT NULL,
	"color_border" varchar(100) NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"is_closed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pipeline_stages_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "priorities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"display_order" integer NOT NULL,
	"color_bg" varchar(100) DEFAULT 'bg-slate-50' NOT NULL,
	"color_text" varchar(100) DEFAULT 'text-slate-600' NOT NULL,
	"color_dot" varchar(100) DEFAULT 'bg-slate-400' NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "priorities_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "regions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"display_order" integer NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "regions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "revenue_brackets" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"display_order" integer NOT NULL,
	"sort_value" integer DEFAULT 0 NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "revenue_brackets_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;