import { getIdentity } from "../../../../../cursor/identity";
import { loadMasteryForUser, saveMasteryForUser } from "@/lib/vocabulary/mastery/server";
import type { MasteryState } from "@/lib/vocabulary/mastery/types";

export const runtime = "nodejs";

function storageUserId(identity: { sub: string; stage: string }): string {
  return identity.stage === "preview" ? `preview:${identity.sub}` : identity.sub;
}

export async function GET(request: Request) {
  const identity = await getIdentity(request);
  if (!identity.verified) {
    return Response.json({ error: "unauthorized", reason: identity.reason }, { status: 401 });
  }
  const state = await loadMasteryForUser(storageUserId(identity));
  return Response.json(state, { headers: { "cache-control": "private, no-store" } });
}

export async function PUT(request: Request) {
  const identity = await getIdentity(request);
  if (!identity.verified) {
    return Response.json({ error: "unauthorized", reason: identity.reason }, { status: 401 });
  }
  let body: MasteryState;
  try {
    body = (await request.json()) as MasteryState;
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body || body.version !== 1 || typeof body.words !== "object") {
    return Response.json({ error: "invalid mastery state" }, { status: 400 });
  }
  await saveMasteryForUser(storageUserId(identity), body);
  return Response.json({ ok: true }, { headers: { "cache-control": "private, no-store" } });
}
