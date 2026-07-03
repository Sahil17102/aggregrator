import { useEffect, useState } from "react";
import {
  ArrowOutwardRounded,
  CloseRounded,
  KeyboardArrowDownRounded,
  MenuRounded,
} from "@mui/icons-material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { brandIdentity } from "../../theme/brand";

const desktopLinks = [
  { label: "Platform", to: "/" },
  { label: "Blogs", to: "/" },
  { label: "Track Shipment", to: "/tracking" },
];

const dropdownLinks = [
  { label: "Integrations" },
  { label: "Tools" },
];

const mobileLinks = [
  ...desktopLinks.slice(0, 1),
  { label: "Integrations", to: "/" },
  { label: "Tools", to: "/rate-calculator" },
  ...desktopLinks.slice(1),
];

export default function Navbar({ primaryLabel = "Sign Up", primaryTo = "/signup" }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[999] bg-transparent transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:h-[4.5rem] lg:px-8">
        <RouterLink className="flex items-center gap-2.5 no-underline" to="/">
          <img
            alt="Ship Aggregator"
            className="h-12 w-12 shrink-0 object-contain"
            src={brandIdentity.logoSrc}
          />
          <span className="whitespace-nowrap text-lg font-bold tracking-tight text-white transition-colors">
            Ship Aggregator
          </span>
        </RouterLink>

        <div className="hidden items-center gap-1 lg:flex">
          <RouterLink
            className="rounded-md px-3 py-2 text-sm font-medium text-white/80 no-underline transition-colors hover:bg-white/10 hover:text-white"
            to="/"
          >
            Platform
          </RouterLink>

          {dropdownLinks.map((item) => (
            <div className="relative" key={item.label}>
              <button
                className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                type="button"
              >
                {item.label}
                <KeyboardArrowDownRounded className="h-3.5 w-3.5 transition-transform" />
              </button>
            </div>
          ))}

          <RouterLink
            className="rounded-md px-3 py-2 text-sm font-medium text-white/80 no-underline transition-colors hover:bg-white/10 hover:text-white"
            to="/"
          >
            Blogs
          </RouterLink>
          <RouterLink
            className="rounded-md px-3 py-2 text-sm font-medium text-white/80 no-underline transition-colors hover:bg-white/10 hover:text-white"
            to="/tracking"
          >
            Track Shipment
          </RouterLink>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <RouterLink
            className="rounded-lg bg-[#ff8a28] px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-sm transition-colors hover:bg-[#f47b14] hover:shadow-md"
            target="_blank"
            to={primaryTo}
          >
            {primaryLabel}
            <ArrowOutwardRounded className="ml-2 inline-block h-4 w-4 align-[-3px]" />
          </RouterLink>
        </div>

        <button
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          className="rounded-md p-2 text-white transition-colors hover:bg-white/10 lg:hidden"
          onClick={() => setMobileMenuOpen((open) => !open)}
          type="button"
        >
          {mobileMenuOpen ? <CloseRounded className="h-6 w-6" /> : <MenuRounded className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="mx-4 rounded-lg border border-white/15 bg-[#0d1b4d]/95 p-3 shadow-2xl backdrop-blur-md lg:hidden">
          <div className="grid gap-1">
            {mobileLinks.map((item) => (
              <RouterLink
                className="rounded-md px-3 py-2 text-sm font-medium text-white/85 no-underline transition-colors hover:bg-white/10 hover:text-white"
                key={`${item.label}-${item.to}`}
                to={item.to}
              >
                {item.label}
              </RouterLink>
            ))}
            <RouterLink
              className="mt-2 rounded-lg bg-[#ff8a28] px-4 py-2.5 text-center text-sm font-semibold text-white no-underline transition-colors hover:bg-[#f47b14]"
              target="_blank"
              to={primaryTo}
            >
              {primaryLabel}
            </RouterLink>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
