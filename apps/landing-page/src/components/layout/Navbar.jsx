import { ArrowOutwardRounded } from "@mui/icons-material";
import { Box, Button, Stack } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink, useLocation } from "react-router-dom";
import BrandLogo from "../brand/BrandLogo";
import BrandSurface from "../brand/BrandSurface";
import { brand, brandEffects, brandIdentity } from "../../theme/brand";

const defaultLinks = [
  { label: "Tracking", to: "/tracking" },
  { label: "Rate Calculator", to: "/rate-calculator" },
  { label: "Weight Calculator", to: "/weight-calculator" },
];

export default function Navbar({
  links = defaultLinks,
  primaryLabel = "Sign Up",
  primaryTo = "/signup",
}) {
  const location = useLocation();

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1200,
        px: { xs: 1.4, sm: 2.4, lg: 3.2 },
        py: { xs: 0.8, sm: 1.35 },
        width: "100%",
        maxWidth: "100vw",
      }}
    >
      <BrandSurface
        variant="glass"
        sx={{
          px: { xs: 0.75, sm: 2.5, lg: 3 },
          py: { xs: 0.7, sm: 1.1 },
          borderRadius: { xs: "8px", sm: "10px" },
          background: alpha("#FFFFFF", 0.92),
          border: brandEffects.border,
          boxShadow: "0 18px 48px rgba(68, 92, 138, 0.18)",
          width: "100%",
          minWidth: 0,
        }}
      >
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          spacing={{ xs: 0.35, sm: 2 }}
          sx={{ minWidth: 0, width: "100%" }}
        >
          <RouterLink aria-label={`${brandIdentity.name} home`} to="/">
            <BrandLogo sx={{ width: { xs: 64, sm: 118, md: 128 } }} />
          </RouterLink>

          <Stack
            alignItems="center"
            direction="row"
            justifyContent="center"
            spacing={0}
            sx={{
              flex: "1 1 auto",
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            {links.map((item) => {
              const active = location.pathname === item.to;

              return (
                <Box
                  component={RouterLink}
                  key={item.to}
                  sx={{
                    px: { xs: 0.18, sm: 0.85, lg: 1.65 },
                    py: { xs: 0.28, sm: 0.8, lg: 1 },
                    borderRadius: 999,
                    color: active ? brand.accent : brand.inkSoft,
                    bgcolor: active ? alpha(brand.accent, 0.12) : "transparent",
                    fontSize: { xs: "0.5rem", sm: "0.72rem", md: "0.92rem" },
                    fontWeight: active ? 800 : 700,
                    lineHeight: 1.1,
                    whiteSpace: "nowrap",
                    minWidth: 0,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      color: brand.ink,
                      bgcolor: alpha(brand.ink, 0.06),
                    },
                  }}
                  to={item.to}
                >
                  {item.label}
                </Box>
              );
            })}
          </Stack>

          <Stack alignItems="center" direction="row" spacing={0.4} sx={{ flexShrink: 0 }}>
            <Button
              component={RouterLink}
              sx={{
                display: { xs: "none", xl: "inline-flex" },
                color: brand.ink,
                fontWeight: 700,
                "&:hover": {
                  backgroundColor: alpha(brand.ink, 0.06),
                },
              }}
              to="/login"
              variant="text"
            >
              Sign In
            </Button>
            <Button
              component={RouterLink}
              endIcon={<ArrowOutwardRounded sx={{ fontSize: 18 }} />}
              sx={{
                minWidth: { xs: 76, sm: 186 },
                px: { xs: 0.5, sm: 2.8 },
                py: { xs: 0.5, sm: 1.15 },
                borderRadius: { xs: "6px", sm: "8px" },
                fontWeight: 800,
                fontSize: { xs: "0.54rem", sm: "0.92rem" },
                whiteSpace: "nowrap",
                color: "#FFFFFF",
                background: "linear-gradient(135deg, #FF7A15 0%, #FFAE57 100%)",
                boxShadow: {
                  xs: "0 12px 24px rgba(255, 122, 21, 0.22)",
                  sm: "0 18px 36px rgba(255, 122, 21, 0.28)",
                },
                "& .MuiButton-endIcon": {
                  ml: { xs: 0.3, sm: 1 },
                  mr: 0,
                  "& svg": { fontSize: { xs: 12, sm: 18 } },
                },
              }}
              to={primaryTo}
              variant="contained"
            >
              {primaryLabel}
            </Button>
          </Stack>
        </Stack>
      </BrandSurface>
    </Box>
  );
}
