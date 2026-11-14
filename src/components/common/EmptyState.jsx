import Button from './Button';

export default function EmptyState({ icon, title, message, actionText, actionTo, onAction }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-icon">{icon}</div>}
      <h4>{title}</h4>
      {message && <p>{message}</p>}
      {actionText && (actionTo ? <Button to={actionTo}>{actionText}</Button> : <Button onClick={onAction}>{actionText}</Button>)}
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="empty-state">
      <h4>Oops!</h4>
      <p>{message}</p>
      {onRetry && <Button variant="outline" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
