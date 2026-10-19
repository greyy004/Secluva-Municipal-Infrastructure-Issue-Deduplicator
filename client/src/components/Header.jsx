import { Link, NavLink } from "react-router-dom";
import "./Header.css";

function Header() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="site-brand" to="/" aria-label="Secluva home">
          <img className="site-brand-logo" src="/logo.svg" alt="" />
          <span>Secluva</span>
        </Link>

        <nav className="site-nav" aria-label="Main navigation">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/login">Log in</NavLink>
          <NavLink className="site-nav-cta" to="/register">Get started</NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Header;
