import { alpha, Box, Typography, useTheme } from '@mui/material'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import React from 'react'
import styles from './CustomInput.module.css'

interface CustomDatePickerProps {
  label?: string
  required?: boolean
  value?: string | Date | null
  onChange?: (e: { target: { value: string } }) => void
  placeholder?: string
  helperText?: string
  width?: string | number
  topMargin?: boolean
  error?: boolean
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label = '',
  required = false,
  value,
  onChange,
  placeholder = '',
  helperText,
  width = '100%',
  topMargin = true,
  error = false,
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <div
      className={styles.inputContainer}
      style={{
        marginTop: topMargin ? '16px' : '0px',
      }}
    >
      {label && (
        <Typography sx={{ fontSize: '13px', color: theme.palette.text.secondary }} mb={0.5} className={styles.customLabel}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </Typography>
      )}

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          orientation="landscape"
          value={value ? new Date(value as string) : null}
          onChange={(newValue: Date | null) => {
            if (onChange) {
              const formatted = newValue
                ? newValue.toISOString().split('T')[0] // yyyy-MM-dd
                : ''
              onChange({ target: { value: formatted } })
            }
          }}
          slotProps={{
            textField: {
              fullWidth: true,
              sx: {
                width,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                  backgroundColor: isDark ? '#101720' : '#FFFFFF',
                  color: theme.palette.text.primary,
                  '& fieldset': {
                    borderColor: isDark ? alpha('#f8fafc', 0.14) : alpha('#0f172a', 0.14),
                  },
                  '&:hover fieldset': {
                    borderColor: isDark ? alpha('#8b7cf6', 0.5) : alpha('#0f172a', 0.24),
                  },
                },
                '& .MuiInputBase-input': {
                  padding: '10px',
                  height: 12,
                  fontSize: '0.85rem',
                  zIndex: 2,
                  color: theme.palette.text.primary,
                },
              },
              placeholder,
              helperText,
              error: Boolean(error),
            },
          }}
          enableAccessibleFieldDOMStructure={false} // fix slot error
        />
      </LocalizationProvider>

      {helperText && (
        <Box sx={{ mt: 0.5, textAlign: 'right' }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: '11px',
              opacity: 0.7,
              fontStyle: 'italic',
            }}
          >
            {helperText}
          </Typography>
        </Box>
      )}
    </div>
  )
}

export default CustomDatePicker
