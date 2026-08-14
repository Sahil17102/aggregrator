import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material'
import { useEffect, useState } from 'react'

type ReasonDialogProps = {
  open: boolean
  title: string
  options: string[]
  onClose: () => void
  onSubmit: (reason: string) => void
  loading?: boolean
}
export default function ReasonDialog({
  open,
  title,
  options,
  onClose,
  onSubmit,
  loading = false,
}: ReasonDialogProps) {
  const [selection, setSelection] = useState('')
  const [customReason, setCustomReason] = useState('')

  useEffect(() => {
    if (!open) {
      setSelection('')
      setCustomReason('')
    }
  }, [open])

  const reason = selection === 'other' ? customReason.trim() : selection

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack gap={2} sx={{ pt: 1 }}>
          <TextField
            select
            fullWidth
            label="Reason"
            value={selection}
            onChange={(event) => {
              setSelection(event.target.value)
              if (event.target.value !== 'other') setCustomReason('')
            }}
            SelectProps={{ native: true }}
          >
            <option value="">Select a reason</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
            <option value="other">Other / Custom reason</option>
          </TextField>
          {selection === 'other' ? (
            <TextField
              fullWidth
              required
              multiline
              rows={3}
              label="Custom Reason"
              value={customReason}
              onChange={(event) => setCustomReason(event.target.value)}
              inputProps={{ maxLength: 500 }}
            />
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={!reason || loading}
          onClick={() => onSubmit(reason)}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  )
}
