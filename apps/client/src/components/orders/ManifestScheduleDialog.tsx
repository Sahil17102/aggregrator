import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'

export type ManifestSchedulePayload = {
  pickup_date: string
  pickup_time: string
  expected_package_count?: number
}

type ManifestScheduleDialogProps = {
  open: boolean
  loading?: boolean
  title?: string
  description?: string
  defaultShipmentCount?: number
  showShipmentCount?: boolean
  onClose: () => void
  onConfirm: (payload: ManifestSchedulePayload) => void | Promise<void>
}

const pad = (value: number) => String(value).padStart(2, '0')

const formatDateInput = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const formatTimeInput = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`

const getDefaultSchedule = () => {
  const now = new Date()
  const pickup = new Date(now)
  pickup.setHours(11, 0, 0, 0)
  return {
    pickupDate: formatDateInput(pickup),
    pickupTime: formatTimeInput(pickup),
  }
}

const normalizeTime = (time: string) => {
  const trimmed = time.trim()
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed
  if (/^\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`
  return trimmed
}

export default function ManifestScheduleDialog({
  open,
  loading = false,
  title = 'Schedule Manifest Pickup',
  description = 'Select the pickup date and time before generating the manifest.',
  defaultShipmentCount = 1,
  showShipmentCount = false,
  onClose,
  onConfirm,
}: ManifestScheduleDialogProps) {
  const defaults = useMemo(getDefaultSchedule, [open])
  const [pickupDate, setPickupDate] = useState(defaults.pickupDate)
  const [pickupTime, setPickupTime] = useState(defaults.pickupTime)
  const [shipmentCount, setShipmentCount] = useState(String(Math.max(1, defaultShipmentCount)))

  useEffect(() => {
    if (!open) return
    const nextDefaults = getDefaultSchedule()
    setPickupDate(nextDefaults.pickupDate)
    setPickupTime(nextDefaults.pickupTime)
    setShipmentCount(String(Math.max(1, defaultShipmentCount)))
  }, [defaultShipmentCount, open])

  const today = formatDateInput(new Date())
  const dateError = pickupDate < today
  const timeError = !/^\d{2}:\d{2}$/.test(pickupTime)
  const normalizedShipmentCount = Number(shipmentCount)
  const shipmentCountError =
    showShipmentCount && (!Number.isFinite(normalizedShipmentCount) || normalizedShipmentCount < 1)
  const disableConfirm =
    loading || !pickupDate || !pickupTime || dateError || timeError || shipmentCountError

  const handleConfirm = async () => {
    if (disableConfirm) return
    await onConfirm({
      pickup_date: pickupDate,
      pickup_time: normalizeTime(pickupTime),
      ...(showShipmentCount
        ? { expected_package_count: Math.floor(normalizedShipmentCount) }
        : {}),
    })
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 800, color: '#102A54' }}>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.25} sx={{ pt: 0.5 }}>
          <Typography sx={{ color: '#4C6185', fontSize: 14 }}>{description}</Typography>
          <TextField
            label="Pickup date"
            type="date"
            value={pickupDate}
            onChange={(event) => setPickupDate(event.target.value)}
            error={dateError}
            helperText={dateError ? 'Pickup date cannot be in the past.' : ' '}
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: today }}
          />
          <TextField
            label="Pickup time"
            type="time"
            value={pickupTime}
            onChange={(event) => setPickupTime(event.target.value)}
            error={timeError}
            helperText={timeError ? 'Select a valid pickup time.' : ' '}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          {showShipmentCount && (
            <TextField
              label="Number of shipments"
              type="number"
              value={shipmentCount}
              onChange={(event) => setShipmentCount(event.target.value)}
              error={shipmentCountError}
              helperText={shipmentCountError ? 'Enter at least 1 shipment.' : ' '}
              fullWidth
              inputProps={{ min: 1, step: 1 }}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleConfirm} disabled={disableConfirm}>
          {loading ? 'Scheduling...' : 'Continue'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
