"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { PipelineStagesSettings } from "./PipelineStagesSettings";
import { LookupSettings } from "./LookupSettings";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage pipeline stages, categories, and other configurable values.
        </p>
      </div>

      <Tabs defaultValue="stages" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="stages">Pipeline Stages</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="regions">Regions</TabsTrigger>
          <TabsTrigger value="priorities">Priorities</TabsTrigger>
          <TabsTrigger value="nda">NDA Statuses</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Brackets</TabsTrigger>
        </TabsList>

        <TabsContent value="stages">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Stages</CardTitle>
              <CardDescription>
                Define and reorder the stages companies move through in the acquisition pipeline.
                Drag to reorder, click to rename, or delete unused stages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PipelineStagesSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Company types used across the pipeline. Each category has an associated color for visual identification.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LookupSettings
                type="category"
                label="Category"
                hasColor
                colorType="hex"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions">
          <Card>
            <CardHeader>
              <CardTitle>Regions</CardTitle>
              <CardDescription>
                Geographic regions for grouping and filtering companies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LookupSettings type="region" label="Region" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="priorities">
          <Card>
            <CardHeader>
              <CardTitle>Priorities</CardTitle>
              <CardDescription>
                Priority levels assigned to acquisition targets. Colors are used in badges and the kanban board.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LookupSettings
                type="priority"
                label="Priority"
                hasColor
                colorType="tailwind"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nda">
          <Card>
            <CardHeader>
              <CardTitle>NDA Statuses</CardTitle>
              <CardDescription>
                Track NDA signing status for each target company.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LookupSettings
                type="ndaStatus"
                label="NDA Status"
                hasColor
                colorType="tailwind"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Brackets</CardTitle>
              <CardDescription>
                Revenue ranges for categorizing company size. Drag to set the display order.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LookupSettings type="revenueBracket" label="Revenue Bracket" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
