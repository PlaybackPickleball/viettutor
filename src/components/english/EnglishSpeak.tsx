"use client";

import { useState } from "react";
import { SCENARIOS } from "@/lib/english/scenarios";
import { EnShell, secondaryBtn } from "./EnShell";
import { ScenarioRunner } from "./ScenarioRunner";

export function EnglishSpeak() {
  const [scenarioId, setScenarioId] = useState<string | null>(null);

  return (
    <EnShell title="Nói với giáo viên">
      {!scenarioId ? (
        <div className="space-y-4">
          <p className="text-lg">
            Nói theo tình huống trước. Chưa có phần nói tự do. Nếu giáo viên AI chưa kết nối, bạn vẫn dùng câu mẫu.
          </p>
          {SCENARIOS.map((scenario) => (
            <button key={scenario.id} type="button" className={`${secondaryBtn} w-full`} onClick={() => setScenarioId(scenario.id)}>
              {scenario.titleVi}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <button type="button" className={secondaryBtn} onClick={() => setScenarioId(null)}>
            Chọn tình huống khác
          </button>
          <ScenarioRunner scenarioId={scenarioId} lessonId="speak" onDone={() => setScenarioId(null)} />
        </div>
      )}
    </EnShell>
  );
}
