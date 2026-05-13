// components/KYCPreview/AadhaarCard.tsx
import { Card, CardContent, Typography } from "@mui/material";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  text: any;
}

export default function AadhaarCard({ text }: Props) {
  return (
    <Card
      sx={{
        mt: 2,
        backgroundColor: "#F8FAFC",
        border: "1px solid #D9E2EC",
        boxShadow: "none",
      }}
    >
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          Aadhaar extract
        </Typography>
        <Typography>
          <strong>Name:</strong> {text?.aadhaarName || "-"}
        </Typography>
        <Typography>
          <strong>DOB:</strong> {text?.aadhaarDob || "-"}
        </Typography>
        <Typography>
          <strong>No:</strong> {text?.aadhaarNumber || "-"}
        </Typography>
      </CardContent>
    </Card>
  );
}
