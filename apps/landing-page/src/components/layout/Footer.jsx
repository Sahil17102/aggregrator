import {
  EmailRounded,
  FacebookRounded,
  Instagram,
  LinkedIn,
  LocationOnRounded,
  PhoneRounded,
  CloseRounded,
  YouTube,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { brandIdentity } from "../../theme/brand";

const productLinks = [
  { label: "Platform", to: "/" },
  { label: "Rate Calculator", to: "/rate-calculator" },
  { label: "Weight Estimator", to: "/weight-calculator" },
  { label: "Track Shipment", to: "/tracking" },
  { label: "Integrations", to: "/" },
];

const companyLinks = ["About Us", "Blogs", "Careers", "Contact Us", "Partner With Us"];
const legalLinks = ["Terms of Service", "Privacy Policy", "Refund Policy", "Cookie Policy"];

const socialLinks = [
  { label: "X", href: "https://x.com/", icon: <CloseRounded /> },
  { label: "LinkedIn", href: "https://www.linkedin.com/", icon: <LinkedIn /> },
  { label: "Instagram", href: "https://www.instagram.com/", icon: <Instagram /> },
  { label: "YouTube", href: "https://www.youtube.com/", icon: <YouTube /> },
  { label: "Facebook", href: "https://www.facebook.com/", icon: <FacebookRounded /> },
];

export default function Footer() {
  return (
    <footer className="ship-footer ship-home__dark-grid">
      <div className="ship-footer__inner">
        <div className="ship-footer__brand">
          <RouterLink className="ship-footer__logo" to="/">
            <img alt={brandIdentity.name} src={brandIdentity.logoSrc} />
            <span>Ship Aggregator</span>
          </RouterLink>
          <p>
            A leading courier aggregator company that delivers customized supply chain solutions.
            ISO (9001:2015) certified.
          </p>
          <ul className="ship-footer__contact">
            <li>
              <EmailRounded /> <a href={`mailto:${brandIdentity.supportEmail}`}>{brandIdentity.supportEmail}</a>
            </li>
            <li>
              <PhoneRounded /> <a href={`tel:${brandIdentity.supportPhone}`}>{brandIdentity.supportPhone}</a>
            </li>
            <li>
              <LocationOnRounded /> <span>{brandIdentity.supportAddress}</span>
            </li>
          </ul>
          <div className="ship-footer__socials">
            {socialLinks.map((item) => (
              <a aria-label={item.label} href={item.href} key={item.label} rel="noreferrer" target="_blank">
                {item.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="ship-footer__column">
          <h3>Product</h3>
          {productLinks.map((item) => (
            <RouterLink key={item.label} to={item.to}>
              {item.label}
            </RouterLink>
          ))}
        </div>

        <div className="ship-footer__column">
          <h3>Company</h3>
          {companyLinks.map((item) => (
            <RouterLink key={item} to={item === "Contact Us" ? "/contact" : "/"}>
              {item}
            </RouterLink>
          ))}
        </div>

        <div className="ship-footer__column">
          <h3>Legal</h3>
          {legalLinks.map((item) => (
            <RouterLink key={item} to="/">
              {item}
            </RouterLink>
          ))}
        </div>
      </div>

      <div className="ship-footer__bottom">
        <span>© {new Date().getFullYear()} Ship Aggregator. All rights reserved.</span>
        <span>Made with care in India</span>
      </div>
    </footer>
  );
}
