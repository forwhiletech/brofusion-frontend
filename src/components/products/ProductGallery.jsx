import { useState } from 'react';
import SmartImage from '../common/SmartImage';

export default function ProductGallery({ images = [], name }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState({ on: false, x: 50, y: 50 });
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ on: true, x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };
  return (
    <div className="gallery">
      <div className="gallery-thumbs">
        {images.map((img, i) => (
          <button key={i} type="button" className={i === active ? 'on' : ''} onClick={() => setActive(i)} aria-label={`View image ${i + 1}`}>
            <SmartImage src={img} alt="" />
          </button>
        ))}
      </div>
      <div className="gallery-main" onMouseMove={move} onMouseLeave={() => setZoom({ on: false, x: 50, y: 50 })}>
        <SmartImage src={images[active]} alt={name} style={zoom.on ? { transform: 'scale(1.8)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined} loading="eager" />
      </div>
    </div>
  );
}
