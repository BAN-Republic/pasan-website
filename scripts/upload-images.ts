// Uploads Pasan's images from public/import/ to Sanity and sets them on the
// siteSettings singleton. Only the image fields below are written; every other
// field is left alone. Safe to re-run: Sanity de-duplicates identical uploads.
//
//   npm run upload-images
//
// To change which photo goes where, edit IMAGES and run it again.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "next-sanity";
import { SITE_SETTINGS_ID } from "../lib/types";

const root = process.cwd();
const DIR = path.join(root, "public/import");

/** Hotspot centre (x, y) and size, as fractions of the image. */
type Hotspot = { x: number; y: number; width: number; height: number };

const IMAGES: { field: string; file: string; alt: string; hotspot?: Hotspot }[] = [
  {
    field: "heroImage",
    file: "Thoughtful Director in Warm Studio Light.png",
    alt: "Pasan Rasantha Chandrasekera in a director's chair on set, beside a cinema camera and studio lights",
    hotspot: { x: 0.35, y: 0.3, width: 0.2, height: 0.34 }, // his face, left third
  },
  {
    field: "portraitImage",
    file: "Moody Monochrome Portrait with Clasped Hands.png",
    alt: "Black-and-white portrait of Pasan Rasantha Chandrasekera with his hands clasped",
    hotspot: { x: 0.52, y: 0.5, width: 0.44, height: 0.5 }, // centred on his face
  },
  {
    field: "gradeLabImage",
    file: "Thoughtful Director in a Cinematic Studio.png",
    alt: "Pasan Rasantha Chandrasekera in a director's chair in front of a colour-grading monitor",
    hotspot: { x: 0.34, y: 0.33, width: 0.2, height: 0.4 },
  },
  {
    field: "contactImage",
    file: "Contemplative Filmmaker in a Dark Studio.png",
    alt: "Pasan Rasantha Chandrasekera on set beside a cinema camera rig",
    hotspot: { x: 0.34, y: 0.3, width: 0.2, height: 0.38 },
  },
  {
    field: "logo",
    file: "Metallic Pasan Films Logo (1).png",
    alt: "Films by Pasan",
  },
];

// ---------- env ----------

try {
  process.loadEnvFile(path.join(root, ".env.local"));
} catch {
  fail("Could not read .env.local. Copy .env.example to .env.local and fill it in.");
}
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !token) {
  fail(`Missing in .env.local: ${[!projectId && "NEXT_PUBLIC_SANITY_PROJECT_ID", !token && "SANITY_API_WRITE_TOKEN"].filter(Boolean).join(", ")}`);
}
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01",
  useCdn: false,
});

const missing = IMAGES.filter((img) => !existsSync(path.join(DIR, img.file)));
if (missing.length) fail(`Not found in public/import/:\n${missing.map((m) => `  - ${m.file}`).join("\n")}`);

async function main() {
  const ids: string[] = await client.fetch(`*[_id in [$id, "drafts." + $id]]._id`, { id: SITE_SETTINGS_ID });
  if (!ids.includes(SITE_SETTINGS_ID)) fail("The siteSettings document doesn't exist yet. Run npm run seed first.");

  const fields: Record<string, object> = {};
  for (const img of IMAGES) {
    const asset = await client.assets.upload("image", readFileSync(path.join(DIR, img.file)), {
      filename: img.file,
    });
    fields[img.field] = {
      _type: "image",
      asset: { _type: "reference", _ref: asset._id },
      alt: img.alt,
      ...(img.hotspot
        ? {
            hotspot: { _type: "sanity.imageHotspot", ...img.hotspot },
            crop: { _type: "sanity.imageCrop", top: 0, bottom: 0, left: 0, right: 0 },
          }
        : {}),
    };
    console.log(`✓ ${img.field.padEnd(14)} ← ${img.file} (${asset._id})`);
  }

  // Patch the draft too if one exists, so publishing it doesn't drop the images.
  const tx = client.transaction();
  for (const id of ids) tx.patch(id, (p) => p.set(fields));
  await tx.commit({ visibility: "sync" });
  console.log(`\nPatched ${ids.join(" and ")}: ${Object.keys(fields).join(", ")}`);
}

main().catch((error: unknown) => fail(error instanceof Error ? error.message : String(error)));

function fail(message: string): never {
  console.error(`upload-images: ${message}`);
  process.exit(1);
}
