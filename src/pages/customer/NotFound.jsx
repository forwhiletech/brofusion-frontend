import Button from '../../components/common/Button';

export default function NotFound() {
  return (
    <div className="container page-pad">
      <div className="empty-state">
        <div className="nf-code">404</div>
        <h4>Page not found</h4>
        <p>The page you are looking for doesn&apos;t exist or has been moved.</p>
        <Button to="/">Back to home</Button>
      </div>
    </div>
  );
}
