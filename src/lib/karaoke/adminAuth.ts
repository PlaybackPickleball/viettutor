import {
  requireIdentity,
  requireTeamRole,
  type VerifiedIdentity,
} from "../../../cursor/identity";

/**
 * Karaoke mutate routes: signed-in viewer required.
 * On team apps, only admins may align / approve.
 * Private apps: any admitted viewer (the owner) may proceed.
 */
export async function requireSingAdmin(
  request: Request,
): Promise<VerifiedIdentity | Response> {
  const identity = await requireIdentity(request);
  if (identity instanceof Response) return identity;
  if (identity.appVisibility === "team") {
    return requireTeamRole(identity, ["admin"]);
  }
  return identity;
}

/** Read routes that touch filesystem karaoke data still need a signed-in viewer. */
export async function requireSingViewer(
  request: Request,
): Promise<VerifiedIdentity | Response> {
  return requireIdentity(request);
}
