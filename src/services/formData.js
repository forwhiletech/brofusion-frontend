/** Helpers for building multipart payloads for the admin APIs. */
export const dataUrlToFile = (dataUrl, name = 'upload') => {
  const [meta, b64] = dataUrl.split(',');
  const mime = /data:([^;]+)/.exec(meta)?.[1] || 'image/jpeg';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  const ext = mime.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
  return new File([bytes], `${name}.${ext}`, { type: mime });
};

export const isDataUrl = (s) => typeof s === 'string' && s.startsWith('data:');

export const productToFormData = (data, { isUpdate = false } = {}) => {
  const f = new FormData();
  const put = (k, v) => { if (v !== undefined && v !== null) f.append(k, v); };
  ['name', 'description', 'category', 'gender', 'brand'].forEach((k) => put(k, data[k]));
  put('price', data.price);
  put('discountPrice', data.discountPrice || 0);
  put('sizes', JSON.stringify(data.sizes));
  put('colors', JSON.stringify(data.colors.map((c) => ({ name: c.name, hex: c.hex }))));
  put('variants', JSON.stringify(data.variants.map((v) => ({ size: v.size, color: v.color, stock: v.stock }))));
  put('tags', JSON.stringify(data.tags || []));
  put('isFeatured', !!data.isFeatured);
  put('isActive', data.isActive !== false);

  const images = data.images || [];
  let n = 0;
  const order = images.map((img) => {
    if (isDataUrl(img)) { f.append('images', dataUrlToFile(img, `product-${n}`)); n += 1; return `new:${n - 1}`; }
    return img;
  });
  if (isUpdate) put('imageOrder', JSON.stringify(order));
  else order.filter((t) => !t.startsWith('new:')).forEach((u) => f.append('imageUrls', u));
  return f;
};

/** Generic: plain fields + one optional image (data URL or http URL). */
export const entityToFormData = (data, fields, imageField = 'image') => {
  const f = new FormData();
  fields.forEach((k) => { if (data[k] !== undefined && data[k] !== null) f.append(k, data[k]); });
  const img = data[imageField];
  if (isDataUrl(img)) f.append('image', dataUrlToFile(img, 'image'));
  else if (img) f.append('image', img); // plain URL string (sent as a text field named "image")
  return f;
};
