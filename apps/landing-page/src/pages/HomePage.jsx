import { useEffect, useMemo, useState } from "react";
import {
  ArrowForwardRounded,
  BoltRounded,
  LocalShippingRounded,
} from "@mui/icons-material";
import {
  alpha,
  Box,
  Button,
  Chip,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import BrandSurface from "../components/brand/BrandSurface";
import { getPublicLandingStats } from "../services/api";
import { brand, brandGradients, brandIdentity } from "../theme/brand";

const partnerLogos = [
  { alt: "Delhivery logo", src: "/partner-logos/delhivery.png" },
  { alt: "Blue Dart logo", src: "/partner-logos/blue-dart.png" },
  { alt: "Shadowfax logo", src: "/partner-logos/shadowfax.png" },
  { alt: "Xpressbees logo", src: "/partner-logos/xpressbees.png" },
  { alt: "Xpressbees logo alternate", src: "/partner-logos/xpressbees.png" },
  { alt: "India Post mark", src: "/partner-logos/india-post-mark.svg" },
];

const processSteps = [
  {
    title: "Connect your orders",
    text: "Bring store, marketplace, and offline orders into one premium operations layer with clean validations.",
  },
  {
    title: "Compare live-ready rates",
    text: "Evaluate courier options by lane, SLA, payment mode, and volumetric weight before you commit.",
  },
  {
    title: "Dispatch with confidence",
    text: "Generate labels, assign pickups, and move parcels with real-time milestone updates and exception flags.",
  },
  {
    title: "Track every promise",
    text: "Keep customers and teams aligned with a motion-rich timeline from order creation to doorstep delivery.",
  },
];

const sectionIntro = {
  eyebrowSx: {
    fontSize: { xs: "0.68rem", sm: "0.72rem" },
    fontWeight: 800,
    color: brand.accent,
    textTransform: "uppercase",
    letterSpacing: 0,
  },
  titleSx: {
    mt: 1,
    fontSize: { xs: "1.58rem", md: "2.7rem" },
    lineHeight: 1.02,
    fontWeight: 800,
    letterSpacing: 0,
    color: brand.ink,
  },
  copySx: {
    mt: 1.4,
    color: brand.inkSoft,
    lineHeight: 1.82,
    maxWidth: 760,
  },
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.45 },
};

const fallbackStats = {
  livePickups: 0,
  monthlyDeliveredShipments: 0,
  monthlyOrders: 0,
  annualShipments: 0,
  activeCouriers: 0,
  enabledCouriers: 3,
  trackingVisibilityRate: 0,
};

export default function HomePage() {
  const [landingStats, setLandingStats] = useState(fallbackStats);

  useEffect(() => {
    let active = true;

    getPublicLandingStats()
      .then((data) => {
        if (active) {
          setLandingStats({ ...fallbackStats, ...data });
        }
      })
      .catch(() => {
        if (active) {
          setLandingStats(fallbackStats);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const liveValue = (value, suffix = "") => {
    const safeValue = Number.isFinite(value) ? value : 0;
    return `${new Intl.NumberFormat("en-IN").format(safeValue)}${suffix}`;
  };

  const livePickupsLabel = `${liveValue(landingStats.livePickups)} live pickups`;

  const proofPoints = useMemo(
    () => [
      { value: liveValue(landingStats.enabledCouriers), label: "Enabled courier networks" },
      {
        value: liveValue(landingStats.trackingVisibilityRate, "%"),
        label: "Orders with AWB visibility",
      },
      { value: liveValue(landingStats.annualShipments), label: "Shipments in the last 365 days" },
    ],
    [landingStats]
  );

  const dashboardPreviewMetrics = useMemo(
    () => [
      {
        label: "Shipments delivered this month",
        value: liveValue(landingStats.monthlyDeliveredShipments),
      },
      {
        label: "Courier partners active in orders",
        value: liveValue(landingStats.activeCouriers),
      },
    ],
    [landingStats]
  );

  return (
    <Box
      sx={{
        background: brandGradients.page,
        minHeight: "100vh",
        pb: { xs: 6, md: 8 },
        overflowX: "hidden",
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 1.8, sm: 3 }, width: "100%", maxWidth: "100%" }}>
        <Stack spacing={{ xs: 4.2, md: 7 }}>
          <Box component={motion.section} {...fadeUp} sx={{ pt: { xs: 1.1, md: 3 } }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "repeat(2, minmax(0, 1fr))" },
                alignItems: "center",
                gap: { xs: 1.6, lg: 4 },
                width: "100%",
                minWidth: 0,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Stack spacing={2.4}>
                  <Chip
                    icon={<BoltRounded sx={{ fontSize: 16 }} />}
                    label={`${brandIdentity.shortName} Logistics for modern shipping teams`}
                    sx={{
                      alignSelf: "flex-start",
                      bgcolor: alpha("#FFFFFF", 0.9),
                      color: brand.ink,
                      border: `1px solid ${alpha(brand.ink, 0.08)}`,
                      fontWeight: 700,
                      maxWidth: "100%",
                      px: { xs: 0.1, sm: 0.6 },
                      minHeight: { xs: 24, sm: 32 },
                      fontSize: { xs: "0.56rem", sm: "0.78rem" },
                      "& .MuiChip-label": {
                        px: { xs: 0.8, sm: 1.2 },
                        whiteSpace: "normal",
                      },
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: { xs: "2.16rem", sm: "4rem", lg: "5rem" },
                      lineHeight: { xs: 1.03, lg: 0.95 },
                      fontWeight: 900,
                      letterSpacing: 0,
                      color: brand.ink,
                    }}
                  >
                    Fastest Shipping
                    <Box component="span" sx={{ display: "block", color: brand.accent }}>
                      Across India
                    </Box>
                  </Typography>

                  <Typography
                    sx={{
                      color: brand.inkSoft,
                      maxWidth: 620,
                      fontSize: { xs: "0.78rem", md: "1.08rem" },
                      lineHeight: { xs: 1.82, md: 1.85 },
                    }}
                  >
                    {brandIdentity.tagline} Launch premium shipping experiences with rate
                    intelligence, unified tracking, and beautiful operational clarity while keeping
                    the current client and backend business logic intact.
                  </Typography>

                  <Stack direction="row" spacing={{ xs: 0.75, sm: 1.4 }}>
                    <Button
                      component={RouterLink}
                      endIcon={<ArrowForwardRounded sx={{ fontSize: 18 }} />}
                      sx={{
                        minHeight: { xs: 34, sm: 48 },
                        px: { xs: 1.2, sm: 2.6 },
                        py: { xs: 0.65, sm: 1.1 },
                        borderRadius: { xs: "6px", sm: "8px" },
                        fontSize: { xs: "0.62rem", sm: "0.92rem" },
                        fontWeight: 800,
                        color: "#FFFFFF",
                        bgcolor: brand.accent,
                        boxShadow: "0 12px 24px rgba(255, 122, 21, 0.22)",
                        "&:hover": { bgcolor: "#FF7A15" },
                        "& .MuiButton-endIcon": {
                          ml: 0.45,
                          "& svg": { fontSize: { xs: 14, sm: 18 } },
                        },
                      }}
                      to="/signup"
                      variant="contained"
                    >
                      Start Shipping
                    </Button>
                    <Button
                      component={RouterLink}
                      sx={{
                        minHeight: { xs: 34, sm: 48 },
                        px: { xs: 1.5, sm: 2.6 },
                        py: { xs: 0.65, sm: 1.1 },
                        borderRadius: { xs: "6px", sm: "8px" },
                        fontSize: { xs: "0.62rem", sm: "0.92rem" },
                        fontWeight: 800,
                        color: brand.ink,
                        bgcolor: "#FFFFFF",
                        borderColor: alpha(brand.ink, 0.1),
                        boxShadow: "0 10px 20px rgba(68, 92, 138, 0.08)",
                        "&:hover": {
                          bgcolor: "#FFFFFF",
                          borderColor: alpha(brand.ink, 0.18),
                        },
                      }}
                      to="/tracking"
                      variant="outlined"
                    >
                      Track Order
                    </Button>
                  </Stack>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      gap: { xs: 0.65, sm: 1.2 },
                      maxWidth: "100%",
                    }}
                  >
                    {proofPoints.map((item) => (
                      <BrandSurface
                        key={item.label}
                        sx={{
                          p: { xs: 0.95, sm: 1.7 },
                          borderRadius: { xs: "8px", sm: "10px" },
                          minHeight: { xs: 78, sm: 104 },
                        }}
                        variant="glass"
                      >
                        <Typography
                          sx={{
                            color: brand.ink,
                            fontWeight: 900,
                            fontSize: { xs: "0.86rem", sm: "1.35rem" },
                          }}
                        >
                          {item.value}
                        </Typography>
                        <Typography
                          sx={{
                            color: brand.inkSoft,
                            fontSize: { xs: "0.56rem", sm: "0.82rem" },
                            lineHeight: 1.45,
                          }}
                        >
                          {item.label}
                        </Typography>
                      </BrandSurface>
                    ))}
                  </Box>
                </Stack>
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <BrandSurface
                  sx={{
                    p: { xs: 1.35, md: 3 },
                    minHeight: { lg: 520 },
                    justifyContent: "space-between",
                    gap: { xs: 1.1, sm: 1.8 },
                    borderRadius: { xs: "8px", sm: "10px" },
                    background: `
                      radial-gradient(circle at 15% 10%, rgba(255,255,255,0.82), transparent 20%),
                      radial-gradient(circle at 92% 0%, rgba(255, 156, 75, 0.18), transparent 24%),
                      ${brandGradients.hero}
                    `,
                  }}
                  variant="hero"
                >
                  <Stack
                    alignItems="flex-start"
                    direction="row"
                    justifyContent="space-between"
                    spacing={1.2}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        sx={{
                          color: brand.inkSoft,
                          fontSize: { xs: "0.56rem", sm: "0.74rem" },
                          fontWeight: 800,
                          letterSpacing: 0,
                          textTransform: "uppercase",
                        }}
                      >
                        Dispatch Overview
                      </Typography>
                      <Typography
                        sx={{
                          color: brand.ink,
                          fontSize: { xs: "1rem", sm: "1.65rem" },
                          fontWeight: 800,
                          mt: 0.5,
                          lineHeight: 1.1,
                        }}
                      >
                        Today&apos;s network pulse
                      </Typography>
                    </Box>
                    <Chip
                      icon={<LocalShippingRounded sx={{ fontSize: 16 }} />}
                      label={livePickupsLabel}
                      sx={{
                        bgcolor: alpha("#FFFFFF", 0.84),
                        color: brand.ink,
                        fontWeight: 800,
                        flexShrink: 0,
                        height: { xs: 26, sm: 32 },
                        fontSize: { xs: "0.52rem", sm: "0.78rem" },
                        "& .MuiChip-label": { px: { xs: 0.8, sm: 1.2 } },
                        "& .MuiChip-icon": {
                          fontSize: { xs: 14, sm: 16 },
                          ml: { xs: 0.5, sm: 0.8 },
                        },
                      }}
                    />
                  </Stack>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: { xs: 0.8, sm: 1.2 },
                    }}
                  >
                    {dashboardPreviewMetrics.map((item) => (
                      <BrandSurface
                        key={item.label}
                        sx={{ p: { xs: 0.95, sm: 1.8 }, borderRadius: { xs: "8px", sm: "10px" } }}
                        variant="glass"
                      >
                        <Typography
                          sx={{
                            color: brand.inkSoft,
                            fontSize: { xs: "0.55rem", sm: "0.82rem" },
                            lineHeight: 1.45,
                          }}
                        >
                          {item.label}
                        </Typography>
                        <Typography
                          sx={{
                            color: brand.ink,
                            fontWeight: 900,
                            fontSize: { xs: "0.92rem", sm: "1.75rem" },
                            mt: 0.45,
                          }}
                        >
                          {item.value}
                        </Typography>
                      </BrandSurface>
                    ))}
                  </Box>

                  <BrandSurface
                    sx={{ p: { xs: 1, sm: 2.2 }, borderRadius: { xs: "8px", sm: "10px" } }}
                    variant="soft"
                  >
                    <Stack spacing={{ xs: 0.9, sm: 1.2 }}>
                      {[
                        "See live shipments and what is happening across your network.",
                        "Different teams see the operational slices they need without workflow clutter.",
                        "Build your own tools with the existing APIs and integrations already in the repo.",
                      ].map((item) => (
                        <Stack alignItems="flex-start" direction="row" key={item} spacing={1.1}>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: 999,
                              bgcolor: brand.accent,
                              mt: 0.55,
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            sx={{
                              color: brand.inkSoft,
                              lineHeight: 1.6,
                              fontSize: { xs: "0.68rem", sm: "1rem" },
                            }}
                          >
                            {item}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </BrandSurface>
                </BrandSurface>
              </Box>
            </Box>
          </Box>

          <Box component={motion.section} {...fadeUp}>
            <BrandSurface
              sx={{ p: { xs: 1.65, md: 3 }, borderRadius: { xs: "8px", sm: "10px" } }}
              variant="glass"
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "minmax(0, 0.92fr) minmax(0, 1.35fr)", md: "1fr 2fr" },
                  alignItems: "center",
                  gap: { xs: 1.1, md: 3 },
                  width: "100%",
                  minWidth: 0,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={sectionIntro.eyebrowSx}>Brand integration</Typography>
                  <Box
                    alt={brandIdentity.name}
                    component="img"
                    src={brandIdentity.logoSrc}
                    sx={{ mt: 1.2, width: { xs: 108, md: 210 }, maxWidth: "100%", height: "auto" }}
                  />
                  <Typography
                    sx={{
                      ...sectionIntro.copySx,
                      mt: 1,
                      fontSize: { xs: "0.64rem", md: "1rem" },
                      lineHeight: { xs: 1.5, md: 1.82 },
                    }}
                  >
                    {brandIdentity.tagline} Connected with leading courier brands in one trusted
                    shipping workflow.
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      gap: { xs: 0.55, sm: 1.2 },
                    }}
                  >
                    {partnerLogos.map((item) => (
                      <BrandSurface
                        key={item.alt}
                        sx={{
                          p: { xs: 0.8, sm: 2 },
                          borderRadius: { xs: "8px", sm: "10px" },
                          alignItems: "center",
                          justifyContent: "center",
                          minHeight: { xs: 72, sm: 110 },
                        }}
                        variant="soft"
                      >
                        <Box
                          alt={item.alt}
                          component="img"
                          src={item.src}
                          sx={{
                            width: "100%",
                            maxWidth: { xs: item.src.includes("india-post") ? 54 : 68, sm: 116 },
                            maxHeight: { xs: item.src.includes("xpressbees") ? 44 : 34, sm: 58 },
                            objectFit: "contain",
                            filter: "grayscale(0.08)",
                          }}
                        />
                      </BrandSurface>
                    ))}
                  </Box>
                </Box>
              </Box>
            </BrandSurface>
          </Box>

          <Box component={motion.section} {...fadeUp}>
            <Typography sx={sectionIntro.eyebrowSx}>How it works</Typography>
            <Typography sx={sectionIntro.titleSx}>
              A frictionless dispatch workflow from order sync to doorstep delivery
            </Typography>
            <Typography sx={sectionIntro.copySx}>
              Each step is built to feel fast, polished, and operationally reliable for logistics
              teams.
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
                gap: { xs: 1.2, sm: 1.6 },
                mt: 1,
                width: "100%",
                minWidth: 0,
              }}
            >
              {processSteps.map((step, index) => (
                <Box key={step.title} sx={{ minWidth: 0 }}>
                  <BrandSurface
                    sx={{ p: { xs: 1.25, sm: 2.2 }, borderRadius: { xs: "8px", sm: "10px" } }}
                    variant="card"
                  >
                    <Box
                      sx={{
                        width: { xs: 38, sm: 56 },
                        height: { xs: 38, sm: 56 },
                        borderRadius: 999,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: index < 3 ? brand.accent : alpha(brand.ink, 0.08),
                        color: index < 3 ? "#FFFFFF" : brand.inkSoft,
                        fontSize: { xs: "0.74rem", sm: "1rem" },
                        fontWeight: 900,
                      }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </Box>
                    <Typography
                      sx={{
                        mt: { xs: 1.2, sm: 2 },
                        color: brand.ink,
                        fontWeight: 800,
                        fontSize: { xs: "0.8rem", sm: "1.05rem" },
                        lineHeight: 1.15,
                      }}
                    >
                      {step.title}
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.75,
                        color: brand.inkSoft,
                        lineHeight: 1.55,
                        fontSize: { xs: "0.66rem", sm: "1rem" },
                      }}
                    >
                      {step.text}
                    </Typography>
                  </BrandSurface>
                </Box>
              ))}
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
