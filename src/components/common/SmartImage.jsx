import { useState } from 'react';
import { PLACEHOLDER_IMG } from '../../assets/images/placeholder';

/** <img> with lazy loading and a branded fallback if the source fails. */
export default function SmartImage({ src, alt = '', className = '', ...rest }) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={failed || !src ? PLACEHOLDER_IMG : src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
