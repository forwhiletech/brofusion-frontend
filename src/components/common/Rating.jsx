import { FaRegStar, FaStar, FaStarHalfAlt } from 'react-icons/fa';

/** Read-only stars, or interactive when onChange is provided. */
export default function Rating({ value = 0, count, size = 14, onChange }) {
  const stars = [1, 2, 3, 4, 5].map((i) => {
    let icon = <FaRegStar />;
    if (value >= i - 0.25) icon = <FaStar />;
    else if (value >= i - 0.75) icon = <FaStarHalfAlt />;
    return onChange
      ? <button type="button" key={i} className="star-btn" onClick={() => onChange(i)} aria-label={`${i} star`}>{icon}</button>
      : <span key={i}>{icon}</span>;
  });
  return (
    <span className="rating" style={{ fontSize: size }} aria-label={`Rated ${value} out of 5`}>
      {stars}
      {count !== undefined && <small className="rating-count">({count})</small>}
    </span>
  );
}
