// TODO: verify Sanity webhook signature and revalidateTag('content') (SPEC §7).
export async function POST() {
  return Response.json({ error: "Not implemented" }, { status: 501 });
}
