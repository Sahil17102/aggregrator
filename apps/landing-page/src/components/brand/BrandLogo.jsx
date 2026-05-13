import { Box } from "@mui/material";
import { brandIdentity } from "../../theme/brand";

export default function BrandLogo({ sx, ...rest }) {
  return (
    <Box
      alt={brandIdentity.name}
      component="img"
      src={brandIdentity.logoSrc}
      sx={{
        width: { xs: 150, sm: 176 },
        height: "auto",
        objectFit: "contain",
        display: "block",
        ...sx,
      }}
      {...rest}
    />
  );
}
