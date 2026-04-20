import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="stack-wide notfound-page">
      <div className="stack auth-form-card">
        <h1>Page Not Found</h1>
        <p>The page you requested does not exist or has been moved.</p>
        <div className="inline-actions">
          <Link to="/" className="btn">Go Home</Link>
          <Link to="/catalog">Browse Catalog</Link>
        </div>
      </div>
    </section>
  )
}
