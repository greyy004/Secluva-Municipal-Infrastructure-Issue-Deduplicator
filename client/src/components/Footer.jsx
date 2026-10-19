import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <Link className="footer-brand" to="/" aria-label="Secluva home">
          <img src="/logo.svg" alt="" />
          <span>Secluva</span>
        </Link>
        <p>Simple, secure access to what matters.</p>
        <span className="footer-copyright">© {new Date().getFullYear()} Secluva</span>
      </div>
    </footer>
  );
}

export default Footer;
