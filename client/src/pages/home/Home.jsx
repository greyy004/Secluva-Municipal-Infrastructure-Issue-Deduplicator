import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <span className="home-eyebrow">A calmer way forward</span>
        <h1>Security that feels <span>simple.</span></h1>
        <p className="home-intro">Secluva helps you keep what matters protected, with a clear experience from the very first step.</p>
        <div className="home-actions">
          <Link className="home-primary-link" to="/register">Get started <span aria-hidden="true">→</span></Link>
          <Link className="home-secondary-link" to="/login">Log in</Link>
        </div>
      </section>
    </div>
  );
}

export default Home
