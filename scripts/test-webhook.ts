/**
 * Sends test requests to /api/revalidate, signed the way Sanity signs its webhooks.
 *
 *   npm run test:webhook                         # http://localhost:3000/api/revalidate
 *   npm run test:webhook -- https://your-site.com # a deployed site (same secret as there)
 *
 * Reads SANITY_REVALIDATE_SECRET from .env.local. Checks:
 *   1. a correctly signed request → 200 { revalidated: true }
 *   2. no signature header       → 401
 *   3. a wrong signature         → 401
 */
import path from "node:path";
import { SIGNATURE_HEADER_NAME, encodeSignatureHeader } from "@sanity/webhook";

try {
  process.loadEnvFile(path.join(process.cwd(), ".env.local"));
} catch {
  // Fine when the secret comes from the shell environment instead.
}

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const url = base.endsWith("/api/revalidate") ? base : `${base}/api/revalidate`;
const secret = process.env.SANITY_REVALIDATE_SECRET?.trim();

if (!secret) {
  console.error("SANITY_REVALIDATE_SECRET is not set. Add it to .env.local (any long random string).");
  process.exit(1);
}

const payload = JSON.stringify({ _id: "test-webhook", _type: "film" });

async function send(label: string, headers: Record<string, string>, expected: number): Promise<boolean> {
  const started = Date.now();
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: payload });
  const body = await res.text();
  const ok = res.status === expected;
  console.log(`${ok ? "✓" : "✗"} ${label}: ${res.status} (expected ${expected}) in ${Date.now() - started} ms  ${body}`);
  return ok;
}

async function main() {
  console.log(`Testing ${url}\n`);
  const signed = await encodeSignatureHeader(payload, Date.now(), secret!);
  const wrong = await encodeSignatureHeader(payload, Date.now(), `${secret}-wrong`);
  const results = [
    await send("signed request", { [SIGNATURE_HEADER_NAME]: signed }, 200),
    await send("missing signature", {}, 401),
    await send("wrong signature", { [SIGNATURE_HEADER_NAME]: wrong }, 401),
  ];
  const failed = results.filter((r) => !r).length;
  console.log(failed ? `\n${failed} check(s) failed.` : "\nAll checks passed.");
  process.exit(failed ? 1 : 0);
}

main().catch((error: unknown) => {
  console.error(`Couldn't reach ${url}:`, error instanceof Error ? error.message : error);
  process.exit(1);
});
