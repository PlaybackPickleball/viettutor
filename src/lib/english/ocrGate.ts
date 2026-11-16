/** English scan must not invent a practice sentence when OCR fails. */

export type OcrRead =
  | { status: "error"; message: string }
  | { status: "empty"; message: string }
  | { status: "needs_confirm"; text: string };

export function interpretOcr(raw: string | null, error: string | null): OcrRead {
  if (error) {
    return {
      status: "error",
      message: "Không đọc được ảnh. Chụp lại, hoặc gõ lại câu bạn thấy. Không có câu mẫu thay thế.",
    };
  }
  const text = (raw ?? "").replace(/\s+/g, " ").trim();
  if (!text) {
    return {
      status: "empty",
      message: "Ảnh chưa ra chữ. Chọn vùng chữ rõ hơn rồi thử lại.",
    };
  }
  return { status: "needs_confirm", text };
}

export function teachGate(
  text: string,
  confirmed: boolean,
): { ok: true } | { ok: false; message: string } {
  const cleaned = text.trim();
  if (!cleaned) return { ok: false, message: "Chưa có chữ để học." };
  if (!confirmed) return { ok: false, message: "Hãy đọc lại và xác nhận chữ trước khi học." };
  return { ok: true };
}

export function splitWords(text: string): string[] {
  return text
    .split(/\s+/)
    .map((word) => word.replace(/^[^A-Za-z0-9']+|[^A-Za-z0-9']+$/g, ""))
    .filter(Boolean);
}
