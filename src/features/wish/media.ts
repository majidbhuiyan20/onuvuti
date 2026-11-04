/** Browser-side media helpers: shrink photos and read blobs as data URLs before upload. */

const MAX_PHOTO_BYTES = 700_000;

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("ফাইল পড়া যায়নি"));
    reader.readAsDataURL(blob);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("ছবিটি খোলা যায়নি"));
    img.src = src;
  });
}

/** Resizes to `maxSide` and re-encodes as JPEG, lowering quality until it fits the upload cap. */
export async function compressImage(file: File, maxSide = 900): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("শুধু ছবি (JPG/PNG/WebP) দেওয়া যাবে");

  const img = await loadImage(await blobToDataUrl(file));
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("ছবি প্রসেস করা যায়নি");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  for (const quality of [0.8, 0.65, 0.5, 0.38]) {
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    if (dataUrl.length <= MAX_PHOTO_BYTES) return dataUrl;
  }
  throw new Error("ছবিটি অনেক বড়, অন্য একটি ছোট ছবি দিন");
}

/** Local datetime-input value (YYYY-MM-DDTHH:mm) → RFC3339 UTC string for the API. */
export function localInputToIso(value: string): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

/** Date → value for <input type="datetime-local">. */
export function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

