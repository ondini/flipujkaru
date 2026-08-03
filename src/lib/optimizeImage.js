/**
 * Zmenší a překóduje obrázek do WebP přímo v prohlížeči PŘED nahráním.
 * → výrazně menší soubory v úložišti = rychlejší načítání webu (zdarma, bez Supabase Pro).
 * Při jakékoliv chybě / nevhodném formátu vrátí originál.
 */
export async function optimizeImage(file, { maxSize = 1600, quality = 0.82 } = {}) {
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return file;
  }
  try {
    const img = await loadImage(file);
    const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);

    const blob = await new Promise((res) => canvas.toBlob(res, 'image/webp', quality));
    if (!blob || blob.size >= file.size) return file; // nezvětšuj

    const name = file.name.replace(/\.\w+$/, '') + '.webp';
    return new File([blob], name, { type: 'image/webp' });
  } catch {
    return file;
  }
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}
