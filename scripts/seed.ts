// Seeds docs/content/*.json into Sanity. Safe to re-run: every document has a
// deterministic _id and is written with createOrReplace in one transaction.
// It refuses to run once films exist, because re-running overwrites Studio
// edits and ordering. Override with --force.
//
//   npm run seed
//   npm run seed -- --force

import { readFileSync } from "node:fs";
import path from "node:path";
import { LexoRank } from "lexorank";
import { createClient, type IdentifiedSanityDocumentStub } from "next-sanity";
import { z } from "zod";
import { FILM_CATEGORIES, JOURNEY_STATUSES, SITE_SETTINGS_ID } from "../lib/types";
import { getYouTubeId } from "../lib/youtube";

// npm runs scripts from the project root.
const root = process.cwd();

// ---------- env ----------

try {
  process.loadEnvFile(path.join(root, ".env.local"));
} catch {
  fail("Could not read .env.local. Copy .env.example to .env.local and fill it in.");
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !token) {
  const missing = [
    !projectId && "NEXT_PUBLIC_SANITY_PROJECT_ID",
    !token && "SANITY_API_WRITE_TOKEN",
  ].filter(Boolean);
  fail(`Missing in .env.local: ${missing.join(", ")}`);
}

const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01",
  useCdn: false,
});

// ---------- content files ----------

const categories = FILM_CATEGORIES.map((c) => c.value) as [string, ...string[]];

const FilmJson = z.object({
  title: z.string().min(1),
  youtubeUrl: z.string().refine((url) => getYouTubeId(url), "not a YouTube video link"),
  youtubeId: z.string().optional(), // ignored: derived at fetch time
  client: z.string().min(1),
  product: z.string().optional(),
  category: z.enum(categories),
  featured: z.boolean().optional(),
  order: z.number(),
  todo: z.string().optional(),
});

const JourneyJson = z.object({
  period: z.string().min(1),
  title: z.string().min(1),
  organisation: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(JOURNEY_STATUSES),
  order: z.number(),
  todo: z.string().optional(),
});

const SettingsJson = z.object({
  name: z.string().min(1),
  tagline: z.string().optional(),
  roles: z.array(z.string()).optional(),
  showreelYoutubeUrl: z.string().optional(),
  email: z.string().optional(),
  location: z.string().optional(),
  availability: z.string().optional(),
  socials: z.record(z.string(), z.string()).optional(),
  bioParagraphs: z.array(z.string()).optional(),
  awards: z.array(z.object({ title: z.string(), detail: z.string().optional() })).optional(),
  stats: z
    .array(z.object({ value: z.number(), suffix: z.string().optional(), label: z.string() }))
    .optional(),
  clients: z.array(z.string()).optional(),
  marqueeWords: z.array(z.string()).optional(),
  craftTags: z.array(z.string()).optional(),
  journeyIntro: z.string().optional(),
  footerLine: z.string().optional(),
  quote: z.string().optional(),
  todo: z.string().optional(),
});

function readJson<T>(file: string, schema: z.ZodType<T>): T {
  const full = path.join(root, "docs/content", file);
  const result = schema.safeParse(JSON.parse(readFileSync(full, "utf8")));
  if (!result.success) fail(`${file} is invalid:\n${z.prettifyError(result.error)}`);
  return result.data;
}

const films = readJson("films.json", z.array(FilmJson)).toSorted((a, b) => a.order - b.order);
const journey = readJson("journey.json", z.array(JourneyJson)).toSorted((a, b) => a.order - b.order);
const settings = readJson("settings.json", SettingsJson);

// ---------- helpers ----------

/**
 * Same ranks the plugin's "Reset order" writes: start at LexoRank.min() and
 * step genNext() twice per document, leaving room to drag items in between.
 */
function orderRanks(count: number): string[] {
  let rank = LexoRank.min();
  return Array.from({ length: count }, () => {
    rank = rank.genNext().genNext();
    return rank.toString();
  });
}

/** ASCII slug; Sinhala-only titles fall back to `fallback`. */
function slugify(text: string, fallback: string): string {
  const slug = text
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
  return slug || fallback;
}

const todos: string[] = [];

/**
 * One-line Portable Text block; `_text_` becomes italic (e.g. a film title).
 * Keys are derived from `key` so re-seeding produces identical documents.
 */
function toBlock(text: string, key: string) {
  const children = text
    .split(/_(.+?)_/)
    .map((part, i) => ({ _type: "span", _key: `${key}-s${i}`, text: part, marks: i % 2 ? ["em"] : [] }))
    .filter((span) => span.text);
  return [{ _type: "block", _key: key, style: "normal", markDefs: [], children }];
}

/** Values starting with "TODO" are placeholders: report them, don't store them. */
function real(value: string | undefined, where: string): string | undefined {
  if (value?.toUpperCase().startsWith("TODO")) {
    todos.push(`${where}: placeholder "${value}" not stored`);
    return undefined;
  }
  return value;
}

// ---------- documents ----------

const usedSlugs = new Set<string>();
const filmRanks = orderRanks(films.length);
const filmDocs = films.map((film, i) => {
  const youtubeId = getYouTubeId(film.youtubeUrl)!;
  let slug = slugify(film.title, youtubeId.toLowerCase());
  if (usedSlugs.has(slug)) slug = `${slug}-${youtubeId.toLowerCase()}`;
  usedSlugs.add(slug);
  if (film.todo) todos.push(`Film "${film.title}" (${film.youtubeUrl}): ${film.todo}`);
  return {
    _id: `film-${youtubeId}`,
    _type: "film",
    orderRank: filmRanks[i],
    title: film.title,
    slug: { _type: "slug", current: slug },
    youtubeUrl: film.youtubeUrl,
    client: film.client,
    product: film.product,
    category: film.category,
    featured: film.featured ?? false,
    published: true,
  };
});

const journeyRanks = orderRanks(journey.length);
const journeyDocs = journey.map((step, i) => {
  if (step.todo) todos.push(`Journey "${step.title}": ${step.todo}`);
  return {
    _id: `journeyStep-${slugify(step.title, String(step.order))}`,
    _type: "journeyStep",
    orderRank: journeyRanks[i],
    period: step.period,
    title: step.title,
    organisation: step.organisation,
    description: step.description,
    status: step.status,
  };
});

if (settings.todo) todos.push(`Settings: ${settings.todo}`);
const settingsDoc = {
  _id: SITE_SETTINGS_ID,
  _type: "siteSettings",
  name: settings.name,
  tagline: settings.tagline,
  roles: settings.roles,
  showreelYoutubeUrl: settings.showreelYoutubeUrl,
  email: real(settings.email, "Settings email"),
  location: settings.location,
  availability: settings.availability,
  socials: settings.socials,
  bioParagraphs: settings.bioParagraphs,
  awards: settings.awards?.map((award, i) => ({
    _key: `award-${i}`,
    _type: "award",
    title: award.title,
    detail: award.detail ? toBlock(award.detail, `award-${i}-detail`) : undefined,
  })),
  stats: settings.stats?.map((stat, i) => ({ _key: `stat-${i}`, _type: "stat", ...stat })),
  clients: settings.clients,
  marqueeWords: settings.marqueeWords,
  craftTags: settings.craftTags,
  journeyIntro: settings.journeyIntro,
  footerLine: settings.footerLine,
  quote: settings.quote,
};

// No BTS frames yet: they need images, which are uploaded later.

// ---------- write ----------

const ids = [...filmDocs, ...journeyDocs].map((doc) => doc._id);
const duplicate = ids.find((id, i) => ids.indexOf(id) !== i);
if (duplicate) fail(`Duplicate _id generated: ${duplicate}`);

const transaction = client.transaction();
const docs: IdentifiedSanityDocumentStub[] = [settingsDoc, ...filmDocs, ...journeyDocs];
for (const doc of docs) transaction.createOrReplace(doc);

const force = process.argv.includes("--force");

async function main() {
  // Raw perspective (the default for this API version): drafts count too.
  const existing = await client.fetch<number>(`count(*[_type == "film"])`);
  if (existing > 0) {
    if (!force) {
      fail(
        `${projectId}/${dataset} already has ${existing} film(s), so nothing was written.\n` +
          `  Re-seeding replaces every seeded document: Studio edits, hidden/featured flags and\n` +
          `  drag-and-drop ordering are lost. To do it anyway: npm run seed -- --force`,
      );
    }
    console.warn(
      `⚠ --force: overwriting ${existing} existing film(s). Studio edits and ordering on seeded documents will be lost.`,
    );
  }

  console.log(`Seeding ${projectId}/${dataset} …`);
  await transaction.commit({ visibility: "sync" });
  console.log(`✓ 1 siteSettings, ${filmDocs.length} films, ${journeyDocs.length} journey steps`);

  if (todos.length) {
    console.log(`\nTODO (${todos.length}):`);
    for (const todo of todos) console.log(`  - ${todo}`);
  }
}

main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});

function fail(message: string): never {
  console.error(`seed: ${message}`);
  process.exit(1);
}
