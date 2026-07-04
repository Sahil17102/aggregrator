import { alpha } from "@mui/material/styles";

export const brand = {
  ink: "#0D1B4D",
  inkSoft: "#607397",
  page: "#EEF3FB",
  cream: "#F8FAFE",
  sky: "#D7E2F3",
  aqua: "#EAF1FB",
  accent: "#FF8A28",
  gold: "#FFB15A",
  line: "#D6E0EF",
  surface: "#FFFFFF",
  surfaceGlass: "rgba(255,255,255,0.88)",
  shadow: "0 28px 60px rgba(68, 92, 138, 0.14)",
};

export const brandIdentity = {
  name: "Ship Aggregator",
  shortName: "Ship Aggregator",
  tagline: "Customized supply chain solutions.",
  supportEmail: "cs@shipaggregator.com",
  supportPhone: "+91 94038 91046",
  supportAddress: "G-10, Bajrang Complex, Telipara, Bilaspur, Chhattisgarh",
  logoSrc: "/favicon.jpg",
};

export const brandGradients = {
  page: `
    radial-gradient(circle at 0% 0%, rgba(255, 255, 255, 0.96), transparent 30%),
    radial-gradient(circle at 100% 0%, rgba(215, 226, 243, 0.72), transparent 32%),
    linear-gradient(180deg, #E8EEF8 0%, #F6F8FC 52%, #EEF2FA 100%)
  `,
  button: "linear-gradient(135deg, #FF7A15 0%, #FFAE57 100%)",
  hero: "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(234,240,249,0.94) 58%, rgba(216,226,241,0.9) 100%)",
  surface: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,254,0.98) 100%)",
  softSurface: "linear-gradient(180deg, rgba(250,252,255,0.98) 0%, rgba(240,245,252,0.98) 100%)",
  analytics: "linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(235,241,249,0.95) 56%, rgba(255,237,220,0.88) 100%)",
};

export const brandEffects = {
  border: `1px solid ${alpha(brand.line, 0.92)}`,
  mutedBorder: `1px solid ${alpha(brand.ink, 0.08)}`,
};
