import {
  requireIdentity,
  requireTeamRole,
  type VerifiedIdentity,
} from "../../../cursor/identity";

/**
 * Karaoke admin emails (comma-separated). Private-app invitees not on this
 * list cannot run align / approve. Override via SING_ADMIN_EMAILS secret.
 */
const DEFAULT_SING_ADMIN_EMAILS = "musadoproductions@gmail.com";

function adminEmailAllowlist(): Set<string> {
  const raw = (process.env.SING_ADMIN_EMAILS || DEFAULT_SING_ADMIN_EMAILS).trim();
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
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
 * - Team apps: Cursor team admin only
 * - Private apps: signed-in person whose email is on SING_ADMIN_EMAILS
 *   (not every invited viewer)
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

  // Private (or unexpected visibility): explicit allowlist — not every invitee.
  if (identity.simulated) {
    return identity;
  }
  const email = identity.email.trim().toLowerCase();
  if (!email || !adminEmailAllowlist().has(email)) {
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
