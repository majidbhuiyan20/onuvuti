/**
 * Client-side Canvas Image Compression
 * Resizes any image to a max dimension (default 1280px) and compresses to JPEG
 * at 0.82 quality, reducing multi-megabyte photos to a crisp ~120KB-250KB payload.
 */
export async function compressImageToDataUrl(
  file: File,
  maxDimension = 1280,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.FileReader) {
      reject(new Error("Canvas compression is only available in browser."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("ফাইলটি পড়া যায়নি।"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("ছবিটি লোড করা সম্ভব হয়নি।"));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

