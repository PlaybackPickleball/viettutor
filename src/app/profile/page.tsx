import { ProgressClient } from "@/app/progress/ProgressClient";

/** Profile tab — reuses ProgressClient (streak, XP surfaces, settings link). */
export default function ProfilePage() {
  return <ProgressClient heading="Profile" />;
}