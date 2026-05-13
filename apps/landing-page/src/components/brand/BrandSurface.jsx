import { Box } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { brand, brandGradients } from "../../theme/brand";

const variantStyles = {
  card: {
    background: brandGradients.surface,
    border: `1px solid ${alpha(brand.line, 0.92)}`,
    boxShadow: brand.shadow,
  },
  glass: {
    backgroundColor: brand.surfaceGlass,
    border: `1px solid ${alpha("#FFFFFF", 0.72)}`,
    backdropFilter: "blur(18px)",
    boxShadow: brand.shadow,
  },
  hero: {
    background: brandGradients.hero,
    border: `1px solid ${alpha("#FFFFFF", 0.76)}`,
    boxShadow: "0 28px 80px rgba(15, 44, 67, 0.12)",
  },
  soft: {
    background: brandGradients.softSurface,
    border: `1px solid ${alpha(brand.ink, 0.08)}`,
    boxShadow: "0 18px 38px rgba(15, 44, 67, 0.06)",
  },
  dark: {
    background: `linear-gradient(180deg, ${brand.ink} 0%, #163E59 100%)`,
    color: "#FFFFFF",
    border: `1px solid ${alpha("#FFFFFF", 0.16)}`,
    boxShadow: "0 28px 60px rgba(15, 44, 67, 0.22)",
  },
};

export default function BrandSurface({ variant = "card", sx, children, ...rest }) {
  return (
    <Box
      sx={[
        {
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          borderRadius: { xs: "8px", sm: "10px" },
        },
        variantStyles[variant],
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...rest}
    >
      {children}
    </Box>
  );
}
