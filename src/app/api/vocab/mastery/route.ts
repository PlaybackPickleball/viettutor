import { getIdentity } from "../../../../../cursor/identity";
import {
  assertMasteryStateLimits,
  MAX_MASTERY_BODY_BYTES,
} from "@/lib/vocabulary/mastery/limits";
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

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > MAX_MASTERY_BODY_BYTES) {
    return Response.json({ error: "payload_too_large" }, { status: 413 });
  }

  const raw = await request.text();
  if (raw.length > MAX_MASTERY_BODY_BYTES) {
    return Response.json({ error: "payload_too_large" }, { status: 413 });
  }

  let body: MasteryState;
  try {
    body = JSON.parse(raw) as MasteryState;
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  const limits = assertMasteryStateLimits(body);
  if (!limits.ok) {
    return Response.json({ error: limits.error }, { status: 400 });
  }

  await saveMasteryForUser(storageUserId(identity), body);
  return Response.json({ ok: true }, { headers: { "cache-control": "private, no-store" } });
}
