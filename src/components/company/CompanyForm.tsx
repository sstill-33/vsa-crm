"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { api } from "~/trpc/react";
import { useStages } from "~/lib/hooks/useStages";
import { useLookup } from "~/lib/hooks/useLookup";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

const formSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(255),
  category: z.string().min(1, "Category is required").max(255),
  pipelineStage: z.string().min(1).max(255),
  specialty: z.string().max(500),
  location: z.string().max(255),
  region: z.string(),
  ndaStatus: z.string().min(1).max(255),
  estimatedRevenue: z.string().max(100),
  revenueBracket: z.string().min(1).max(255),
  website: z.string().max(500),
  priority: z.string().min(1).max(255),
  primaryContactName: z.string().max(255),
  primaryContactTitle: z.string().max(255),
  primaryContactEmail: z.string().max(255),
  primaryContactPhone: z.string().max(50),
  askingPrice: z.string().max(100),
  estimatedEbitda: z.string().max(100),
  employeeCount: z.string(),
  yearFounded: z.string(),
  ownershipType: z.string().max(100),
  source: z.string().max(255),
  assignedTo: z.string().max(255),
  tags: z.string(),
  strategicFitNotes: z.string(),
  synergyNotes: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

// Sentinel value for unselected optional selects
const NONE_VALUE = "__none__";

export function CompanyForm() {
  const router = useRouter();
  const { stageNames } = useStages();
  const { names: categoryNames } = useLookup("category");
  const { names: regionNames } = useLookup("region");
  const { names: ndaNames } = useLookup("ndaStatus");
  const { names: priorityNames } = useLookup("priority");
  const { names: bracketNames } = useLookup("revenueBracket");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      category: "",
      pipelineStage: "Identified",
      specialty: "",
      location: "",
      region: "",
      ndaStatus: "N/A",
      estimatedRevenue: "",
      revenueBracket: "TBD",
      website: "",
      priority: "Medium",
      primaryContactName: "",
      primaryContactTitle: "",
      primaryContactEmail: "",
      primaryContactPhone: "",
      askingPrice: "",
      estimatedEbitda: "",
      employeeCount: "",
      yearFounded: "",
      ownershipType: "",
      source: "",
      assignedTo: "",
      tags: "",
      strategicFitNotes: "",
      synergyNotes: "",
    },
  });

  const createCompany = api.company.create.useMutation({
    onSuccess: (data) => {
      toast.success("Company created", {
        description: `${data?.companyName} has been added to the pipeline.`,
      });
      if (data?.id) {
        router.push(`/company/${data.id}`);
      } else {
        router.push("/pipeline");
      }
    },
    onError: (error) => {
      toast.error("Failed to create company", { description: error.message });
    },
  });

  function onSubmit(data: FormValues) {
    // Validate email if provided
    if (data.primaryContactEmail?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.primaryContactEmail.trim())) {
        toast.error("Invalid email address");
        return;
      }
    }

    const payload: Record<string, unknown> = {
      companyName: data.companyName,
      category: data.category,
      pipelineStage: data.pipelineStage,
      ndaStatus: data.ndaStatus,
      revenueBracket: data.revenueBracket,
      priority: data.priority,
    };

    // Optional string fields
    const optionalStringFields = [
      "specialty",
      "location",
      "website",
      "estimatedRevenue",
      "primaryContactName",
      "primaryContactTitle",
      "primaryContactPhone",
      "askingPrice",
      "estimatedEbitda",
      "ownershipType",
      "source",
      "assignedTo",
      "tags",
      "strategicFitNotes",
      "synergyNotes",
    ] as const;

    for (const key of optionalStringFields) {
      const val = data[key];
      if (val?.trim()) {
        payload[key] = val.trim();
      }
    }

    // Email - needs special handling for empty string
    if (data.primaryContactEmail?.trim()) {
      payload.primaryContactEmail = data.primaryContactEmail.trim();
    }

    // Optional field
    if (data.region && data.region !== NONE_VALUE) {
      payload.region = data.region;
    }

    // Optional number fields
    if (data.employeeCount?.trim()) {
      const num = parseInt(data.employeeCount, 10);
      if (!isNaN(num)) payload.employeeCount = num;
    }
    if (data.yearFounded?.trim()) {
      const num = parseInt(data.yearFounded, 10);
      if (!isNaN(num)) payload.yearFounded = num;
    }

    createCompany.mutate(
      payload as Parameters<typeof createCompany.mutate>[0],
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/pipeline">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Add New Company</h1>
          </div>
          <Button type="submit" disabled={createCompany.isPending}>
            {createCompany.isPending ? "Creating..." : "Create Company"}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Company Name{" "}
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 align-super" />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Company name..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Category{" "}
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 align-super" />
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoryNames.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pipelineStage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pipeline Stage</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {stageNames.map((stage) => (
                            <SelectItem key={stage} value={stage}>
                              {stage}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialty</FormLabel>
                      <FormControl>
                        <Input placeholder="Company specialty..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || NONE_VALUE}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>No region</SelectItem>
                          {regionNames.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ndaStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NDA Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ndaNames.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimatedRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Revenue</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. $5M-$10M" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="revenueBracket"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Revenue Bracket</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bracketNames.map((b) => (
                            <SelectItem key={b} value={b}>
                              {b}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorityNames.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="How was this company found?"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned To</FormLabel>
                      <FormControl>
                        <Input placeholder="Team member name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Comma-separated tags"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="primaryContactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Contact Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Contact name..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="primaryContactTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Job title..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="primaryContactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="primaryContactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="(555) 123-4567"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Deal Details */}
            <Card>
              <CardHeader>
                <CardTitle>Deal Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="askingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asking Price</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. $15M" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estimatedEbitda"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated EBITDA</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. $3M" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="employeeCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee Count</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Number of employees"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="yearFounded"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year Founded</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 1995"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ownershipType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ownership Type</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Private, Family-owned"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Strategic Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Strategic Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="strategicFitNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Strategic Fit Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Why is this company a good fit?"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="synergyNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Synergy Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Potential synergies and benefits..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom submit button (mobile-friendly) */}
        <div className="flex justify-end pb-6">
          <Button
            type="submit"
            size="lg"
            disabled={createCompany.isPending}
          >
            {createCompany.isPending ? "Creating..." : "Create Company"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
