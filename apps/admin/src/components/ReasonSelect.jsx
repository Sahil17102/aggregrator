import { Input, Select, Stack, Textarea } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

export default function ReasonSelect({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select a reason',
  customPlaceholder = 'Enter a custom reason',
  multiline = false,
  isDisabled = false,
  maxLength = 128,
}) {
  const isPreset = options.includes(value)
  const [selection, setSelection] = useState(isPreset ? value : value ? 'other' : '')

  useEffect(() => {
    if (!value) {
      setSelection((current) => (current === 'other' ? current : ''))
    } else if (options.includes(value)) {
      setSelection(value)
    } else {
      setSelection('other')
    }
  }, [options, value])

  const CustomField = multiline ? Textarea : Input

  return (
    <Stack spacing="8px">
      <Select
        value={selection}
        onChange={(event) => {
          const nextValue = event.target.value
          setSelection(nextValue)
          onChange(nextValue === 'other' ? '' : nextValue)
        }}
        isDisabled={isDisabled}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
        <option value="other">Other / Custom reason</option>
      </Select>
      {selection === 'other' ? (
        <CustomField
          value={isPreset ? '' : value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={customPlaceholder}
          isDisabled={isDisabled}
          rows={multiline ? 3 : undefined}
          maxLength={maxLength}
        />
      ) : null}
    </Stack>
  )
}
