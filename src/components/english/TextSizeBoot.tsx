"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { browserStore, loadCourse, readTextSize } from "@/lib/experience/store";

/** Applies saved text size and the UI language of the active course. */
export function TextSizeBoot() {
  const path = usePathname();

  useEffect(() => {
    const store = browserStore();
    const record = loadCourse(store).record;
    document.documentElement.dataset.textSize = readTextSize(store);
    const englishPath = path.startsWith("/en") || path.startsWith("/welcome");
    document.documentElement.lang = record?.active === "vi_to_en" || englishPath ? "vi" : "en";
  }, [path]);

  return null;
}
