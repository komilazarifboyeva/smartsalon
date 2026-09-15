const MAX_INPUT_BYTES = 5 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 300 * 1024;
const MAX_DIMENSION = 400;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export function validateAvatarFile(file) {
  if (!file) return 'NO_FILE';
  if (!ALLOWED_TYPES.has(file.type)) return 'INVALID_TYPE';
  if (file.size > MAX_INPUT_BYTES) return 'TOO_LARGE';
  return null;
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('INVALID_TYPE'));
    };
    img.src = objectUrl;
  });
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
  });
}

async function compressImage(file) {
  const img = await loadImageFromFile(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(img, 0, 0, width, height);

  let quality = 0.85;
  let blob = await canvasToBlob(canvas, quality);

  while (blob && blob.size > MAX_OUTPUT_BYTES && quality > 0.35) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, quality);
  }

  if (!blob || blob.size > MAX_OUTPUT_BYTES) {
    throw new Error('TOO_LARGE');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('UPLOAD_FAILED'));
    reader.readAsDataURL(blob);
  });
}

/** Rasmni siqib data URL qaytaradi — Firebase Storage talab qilmaydi. */
export async function prepareUserAvatar(file) {
  const validationError = validateAvatarFile(file);
  if (validationError) {
    throw new Error(validationError);
  }
  return compressImage(file);
}
