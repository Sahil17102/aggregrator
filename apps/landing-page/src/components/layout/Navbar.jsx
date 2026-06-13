import { useEffect, useState } from "react";
import {
  ArrowOutwardRounded,
  CloseRounded,
  MenuRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1200,
        px: { xs: 1.4, sm: 2.4, lg: 3.2 },
        py: { xs: 0.8, sm: 1.35 },
        width: "100%",
        maxWidth: "100%",
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
              display: { xs: "none", lg: "flex" },
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

          <Stack alignItems="center" direction="row" spacing={0.8} sx={{ flexShrink: 0 }}>
            <Button
              component={RouterLink}
              sx={{
                display: { xs: "none", lg: "inline-flex" },
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
                minWidth: { xs: 92, sm: 160, md: 176 },
                px: { xs: 1.1, sm: 2.4 },
                py: { xs: 0.5, sm: 1.15 },
                borderRadius: { xs: "6px", sm: "8px" },
                fontWeight: 800,
                fontSize: { xs: "0.64rem", sm: "0.92rem" },
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
            <IconButton
              aria-label="Open navigation menu"
              onClick={() => setMobileMenuOpen(true)}
              sx={{
                display: { xs: "inline-flex", lg: "none" },
                ml: { xs: 0.25, sm: 0.5 },
                border: `1px solid ${alpha(brand.ink, 0.08)}`,
                backgroundColor: alpha("#FFFFFF", 0.82),
                color: brand.ink,
                "&:hover": {
                  backgroundColor: alpha(brand.ink, 0.06),
                },
              }}
            >
              <MenuRounded />
            </IconButton>
          </Stack>
        </Stack>
      </BrandSurface>

      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: "min(88vw, 340px)",
            background: "linear-gradient(180deg, #FBFCFF 0%, #EDF3FB 100%)",
          },
        }}
      >
        <Box sx={{ p: 2.4, display: "grid", gap: 2 }}>
          <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1.5}>
            <RouterLink aria-label={`${brandIdentity.name} home`} to="/">
              <BrandLogo sx={{ width: 118 }} />
            </RouterLink>
            <IconButton
              aria-label="Close navigation menu"
              onClick={() => setMobileMenuOpen(false)}
              sx={{
                border: `1px solid ${alpha(brand.ink, 0.08)}`,
                color: brand.ink,
              }}
            >
              <CloseRounded />
            </IconButton>
          </Stack>

          <Divider sx={{ borderColor: alpha(brand.ink, 0.08) }} />

          <Stack spacing={1}>
            {links.map((item) => {
              const active = location.pathname === item.to;

              return (
                <Box
                  component={RouterLink}
                  key={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  sx={{
                    px: 1.4,
                    py: 1.2,
                    borderRadius: 3,
                    color: active ? brand.accent : brand.ink,
                    bgcolor: active ? alpha(brand.accent, 0.12) : alpha("#FFFFFF", 0.78),
                    fontWeight: 700,
                    border: `1px solid ${alpha(brand.ink, 0.06)}`,
                  }}
                  to={item.to}
                >
                  {item.label}
                </Box>
              );
            })}
          </Stack>

          <Box
            sx={{
              p: 1.6,
              borderRadius: 3,
              bgcolor: alpha("#FFFFFF", 0.82),
              border: `1px solid ${alpha(brand.ink, 0.06)}`,
            }}
          >
            <Typography sx={{ color: brand.inkSoft, fontSize: "0.85rem", fontWeight: 700 }}>
              Account
            </Typography>
            <Stack spacing={1.2} sx={{ mt: 1.2 }}>
              <Button
                component={RouterLink}
                onClick={() => setMobileMenuOpen(false)}
                sx={{
                  justifyContent: "flex-start",
                  color: brand.ink,
                  fontWeight: 700,
                  px: 0,
                  "&:hover": { backgroundColor: "transparent" },
                }}
                to="/login"
                variant="text"
              >
                Sign In
              </Button>
              <Button
                component={RouterLink}
                endIcon={<ArrowOutwardRounded sx={{ fontSize: 18 }} />}
                onClick={() => setMobileMenuOpen(false)}
                sx={{
                  justifyContent: "space-between",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #FF7A15 0%, #FFAE57 100%)",
                  boxShadow: "0 16px 28px rgba(255, 122, 21, 0.24)",
                }}
                to={primaryTo}
                variant="contained"
              >
                {primaryLabel}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}
