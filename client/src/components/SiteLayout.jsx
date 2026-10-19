import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import "./SiteLayout.css";

function SiteLayout() {
  return (
    <div className="site-layout">
      <Header />
      <main className="site-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default SiteLayout;
