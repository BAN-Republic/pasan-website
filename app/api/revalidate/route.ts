import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";

// POST /api/revalidate — called by the Sanity webhook on every create/update/delete (SPEC §7).
// Checks the signature, then expires the 'content' tag that every cached query shares,
// so the next visit (e.g. Pasan checking his edit) renders fresh content.
// 200 revalidated · 401 bad or missing signature · 500 secret not configured / unexpected error.

interface WebhookBody {
  _type?: string;
  _id?: string;
}

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET?.trim();
  if (!secret) {
    console.error("[revalidate] SANITY_REVALIDATE_SECRET is not set");
    return Response.json({ revalidated: false, message: "Webhook secret not configured" }, { status: 500 });
  }

  try {
    // `true` waits a few seconds for Content Lake consistency, so the re-render reads the new data.
    const { isValidSignature, body } = await parseBody<WebhookBody>(request, secret, true);
    // null = no signature header, false = signature doesn't match.
    if (!isValidSignature) {
      return Response.json({ revalidated: false, message: "Invalid signature" }, { status: 401 });
    }

    revalidateTag("content", { expire: 0 });
    return Response.json({ revalidated: true, type: body?._type ?? null, now: Date.now() });
  } catch (error) {
    console.error("[revalidate] Failed:", error);
    return Response.json({ revalidated: false, message: "Error while revalidating" }, { status: 500 });
  }
}
