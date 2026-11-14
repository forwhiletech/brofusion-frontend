import { useRef, useState } from 'react';
import { FiPlus, FiStar, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { readFileAsDataURL } from '../../utils/helpers';
import SmartImage from '../common/SmartImage';
import Button from '../common/Button';

const MAX_IMAGES = 6;
const MAX_MB = 2;

export default function ImageUploader({ images, onChange, max = MAX_IMAGES }) {
  const input = useRef(null);
  const [url, setUrl] = useState('');

  const addFiles = async (fileList) => {
    const files = Array.from(fileList);
    const room = max - images.length;
    if (files.length > room) toast.warn(`Only ${max} images allowed`);
    const next = [];
    for (const f of files.slice(0, Math.max(room, 0))) {
      if (!f.type.startsWith('image/')) { toast.error(`${f.name} is not an image`); continue; }
      if (f.size > MAX_MB * 1024 * 1024) { toast.error(`${f.name} exceeds ${MAX_MB}MB`); continue; }
      next.push(await readFileAsDataURL(f));
    }
    if (next.length) onChange([...images, ...next]);
    if (input.current) input.current.value = '';
  };

  const addUrl = () => {
    if (!/^https?:\/\/.+/i.test(url.trim())) return toast.error('Enter a valid image URL');
    if (images.length >= max) return toast.warn(`Only ${max} images allowed`);
    onChange([...images, url.trim()]);
    return setUrl('');
  };

  return (
    <div className="uploader">
      <div className="uploader-grid">
        {images.map((img, i) => (
          <div key={i} className="uploader-item">
            <SmartImage src={img} alt={`Product ${i + 1}`} />
            {i === 0 && <span className="tag tag-dark">Cover</span>}
            <div className="uploader-actions">
              {i !== 0 && <button type="button" title="Make cover" onClick={() => onChange([img, ...images.filter((_, k) => k !== i)])}><FiStar /></button>}
              <button type="button" title="Remove" onClick={() => onChange(images.filter((_, k) => k !== i))}><FiTrash2 /></button>
            </div>
          </div>
        ))}
        {images.length < max && (
          <button type="button" className="uploader-add" onClick={() => input.current?.click()}><FiUploadCloud /><span>Upload</span></button>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
      <div className="uploader-url">
        <input placeholder="…or paste image URL" value={url} onChange={(e) => setUrl(e.target.value)} />
        <Button variant="outline" size="sm" onClick={addUrl}><FiPlus /> Add</Button>
      </div>
      <small className="text-muted">Up to {max} images, {MAX_MB}MB each. First image is the cover.</small>
    </div>
  );
}
