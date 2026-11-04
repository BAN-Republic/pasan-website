"use client";

// Must be a client module: NextStudio renders in the browser and this config
// contains functions that cannot be serialised from a server component.

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./env";
import { schemaTypes } from "./schemas";
import { structure } from "./structure";

const SINGLETON_TYPES = new Set(["siteSettings"]);
// No create, duplicate, delete or unpublish on singletons.
const SINGLETON_ACTIONS = new Set(["publish", "discardChanges", "restore"]);

export default defineConfig({
  name: "default",
  title: "Pasan Rasantha — Admin",
  basePath: "/admin",
  projectId,
  dataset,
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter(({ schemaType }) => !SINGLETON_TYPES.has(schemaType)),
  },
  document: {
    actions: (actions, { schemaType }) =>
      SINGLETON_TYPES.has(schemaType)
        ? actions.filter(({ action }) => action && SINGLETON_ACTIONS.has(action))
        : actions,
  },
});
