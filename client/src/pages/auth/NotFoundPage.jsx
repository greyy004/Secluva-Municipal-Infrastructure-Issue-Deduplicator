import { Link } from "react-router-dom";
import "./NotFoundPage.css";

function NotFoundPage() {
  return (
    <main className="not-found">
      <section className="not-found-card" aria-labelledby="not-found-title">
        <div className="error-number" aria-hidden="true">404</div>
        <span className="not-found-eyebrow">Lost in the wild?</span>
        <h1 id="not-found-title">This page wandered off.</h1>
        <p>We couldn't find the page you were looking for. It may have moved or the link may be outdated.</p>
        <Link to="/" className="home-link">
          <span aria-hidden="true">←</span> Back to home
        </Link>
      </section>
    </main>
  );
}

export default NotFoundPage;
