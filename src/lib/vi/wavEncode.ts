/**
 * Re-encode browser recordings (often WebM) to mono WAV for Azure Speech.
 * Azure Pronunciation Assessment accepts WAV/OGG/MP3 — not typical WebM.
 */

function writeString(view: DataView, offset: number, value: string) {
  for (let i = 0; i < value.length; i++) {
    view.setUint8(offset + i, value.charCodeAt(i));
  }
}

/** Encode an AudioBuffer as 16-bit mono PCM WAV at the buffer's sample rate. */
export function encodeAudioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const sampleRate = buffer.sampleRate;
  const channels = buffer.numberOfChannels;
  const length = buffer.length;
  const mono = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    let sample = 0;
    for (let c = 0; c < channels; c++) {
      sample += buffer.getChannelData(c)[i] ?? 0;
    }
    mono[i] = sample / channels;
  }

  const bytesPerSample = 2;
  const blockAlign = bytesPerSample;
  const dataSize = mono.length * bytesPerSample;
  const out = new ArrayBuffer(44 + dataSize);
  const view = new DataView(out);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < mono.length; i++) {
    const s = Math.max(-1, Math.min(1, mono[i]!));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return out;
}

/** Decode any MediaRecorder blob the browser can play, then emit WAV. */
export async function blobToWavBlob(blob: Blob): Promise<Blob> {
  const ctx = new AudioContext();
  try {
    const raw = await blob.arrayBuffer();
    const audio = await ctx.decodeAudioData(raw.slice(0));
    const wav = encodeAudioBufferToWav(audio);
    return new Blob([wav], { type: "audio/wav" });
  } finally {
    await ctx.close().catch(() => undefined);
  }
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result ?? "");
      resolve(value.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
