// Cursor app identity: the simulated viewer for local development. Yours to edit; add-app-identity seeds this file once and never rewrites it.
// Keep values in sync with identity.dev.js (the runtime file identity.ts imports).

import type { DevViewer } from "./identity.js";

export const DEV_VIEWER: DevViewer | null = {
  sub: "user:dev",
  email: "dev@example.com",
  name: "Dev Viewer",
  teamId: 1,
  teamRole: "admin",
};
