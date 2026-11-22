import {
  requireIdentity,
  requireTeamRole,
  type VerifiedIdentity,
} from "../../../cursor/identity";

/**
 * Karaoke admin Cursor user ids (comma-separated numbers from identity.userId).
 * Private-app invitees not on this list cannot align / approve.
 * Override via SING_ADMIN_USER_IDS secret. Default = app owner (Nicola).
 */
const DEFAULT_SING_ADMIN_USER_IDS = "54786101";

function adminUserIdAllowlist(): Set<number> {
  const raw = (process.env.SING_ADMIN_USER_IDS || DEFAULT_SING_ADMIN_USER_IDS).trim();
  return new Set(
    raw
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0),
  );
}

function forbidden(): Response {
  return new Response(JSON.stringify({ error: "forbidden", reason: "sing_admin_required" }), {
    status: 403,
    headers: { "content-type": "application/json", "cache-control": "private, no-store" },
  });
}

/**
 * Karaoke mutate routes (align / approve):
 * - Team apps: Cursor team admin role only
 * - Private apps: signed-in person whose verified Cursor userId is allowlisted
 *   (not every invited viewer; not email-string matching)
 * - API keys: refused
 */
export async function requireSingAdmin(
  request: Request,
): Promise<VerifiedIdentity | Response> {
  const identity = await requireIdentity(request);
  if (identity instanceof Response) return identity;

  if (identity.kind !== "person") {
    return forbidden();
  }

  if (identity.appVisibility === "team") {
    return requireTeamRole(identity, ["admin"]);
  }

  // Private: verified numeric Cursor userId allowlist only.
  if (identity.simulated) {
    return identity;
  }
  if (!identity.userId || !adminUserIdAllowlist().has(identity.userId)) {
    return forbidden();
  }
  return identity;
}

/** Read routes that touch filesystem karaoke data still need a signed-in viewer. */
export async function requireSingViewer(
  request: Request,
): Promise<VerifiedIdentity | Response> {
  return requireIdentity(request);
}
