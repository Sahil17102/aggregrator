// components/KYCPreview/BankChequeCard.tsx
import { Card, CardContent, Typography } from "@mui/material";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  text: any;
}

export default function BankChequeCard({ text }: Props) {
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
          Bank extract
        </Typography>
        <Typography>
          <strong>IFSC:</strong> {text?.ifsc || "-"}
        </Typography>
        <Typography>
          <strong>Account:</strong> {text?.accNo || "-"}
        </Typography>
      </CardContent>
    </Card>
  );
}
