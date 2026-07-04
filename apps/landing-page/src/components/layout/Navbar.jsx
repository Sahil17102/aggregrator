import { useEffect, useState } from "react";
import {
  CloseRounded,
  KeyboardArrowDownRounded,
  MenuRounded,
} from "@mui/icons-material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { brandIdentity } from "../../theme/brand";

const navLinks = [
  { label: "Platform", to: "/" },
  { label: "Integrations", to: "/", dropdown: true },
  { label: "Tools", to: "/rate-calculator", dropdown: true },
  { label: "Blogs", to: "/" },
  { label: "Track Shipment", to: "/tracking" },
];

export default function Navbar({ primaryLabel = "Sign Up", primaryTo = "/signup" }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = location.pathname === "/";
  const solid = !isHome || scrolled || mobileMenuOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className={`ship-nav ${solid ? "ship-nav--solid" : ""}`}>
      <div className="ship-nav__inner">
        <RouterLink className="ship-nav__brand" to="/">
          <img alt={brandIdentity.name} src={brandIdentity.logoSrc} />
          <span>Ship Aggregator</span>
        </RouterLink>

        <div className="ship-nav__links">
          {navLinks.map((item) => (
            <RouterLink className="ship-nav__link" key={item.label} to={item.to}>
              {item.label}
              {item.dropdown ? <KeyboardArrowDownRounded /> : null}
            </RouterLink>
          ))}
        </div>

        <RouterLink className="ship-nav__cta" to={primaryTo}>
          {primaryLabel}
        </RouterLink>

        <button
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          className="ship-nav__menu"
          onClick={() => setMobileMenuOpen((open) => !open)}
          type="button"
        >
          {mobileMenuOpen ? <CloseRounded /> : <MenuRounded />}
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="ship-nav__mobile">
          {navLinks.map((item) => (
            <RouterLink className="ship-nav__mobile-link" key={item.label} to={item.to}>
              {item.label}
            </RouterLink>
          ))}
          <RouterLink className="ship-nav__mobile-cta" to={primaryTo}>
            {primaryLabel}
          </RouterLink>
        </div>
      ) : null}
    </nav>
  );
}
