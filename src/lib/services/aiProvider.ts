/**
 * Server-only OpenAI-compatible chat/completions helper.
 * Reads OPENAI_API_KEY from the environment (bound via Cursor app secrets).
 * Never call from the browser.
 */

export function isAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function chatJson(args: {
  system: string;
  user: string;
  imageDataUrl?: string;
  maxTokens?: number;
}): Promise<{ ok: true; data: unknown } | { ok: false; message: string }> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return { ok: false, message: "OPENAI_API_KEY not configured" };
  }

  const base = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const userContent: Array<Record<string, unknown>> = [{ type: "text", text: args.user }];
  if (args.imageDataUrl) {
    userContent.push({
      type: "image_url",
      image_url: { url: args.imageDataUrl },
    });
  }

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: args.maxTokens ?? 1200,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: args.system },
        { role: "user", content: userContent },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, message: `AI provider error (${res.status}): ${text.slice(0, 240)}` };
  }

  const payload = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content ?? "{}";
  try {
    return { ok: true, data: JSON.parse(content) };
  } catch {
    return { ok: false, message: "AI returned non-JSON content" };
  }
}
