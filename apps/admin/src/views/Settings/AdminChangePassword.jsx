import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { changeAdminPassword } from 'services/auth.service'
import { useState } from 'react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/
const driftX = keyframes`
  0%, 100% { transform: translate3d(-10px, 0, 0) scale(1); }
  50% { transform: translate3d(18px, 0, 0) scale(1.04); }
`
const driftY = keyframes`
  0%, 100% { transform: translate3d(0, -12px, 0) scale(1); }
  50% { transform: translate3d(0, 16px, 0) scale(1.03); }
`
const panZoom = keyframes`
  0% { transform: scale(1) translate3d(0, 0, 0); background-position: 0% 35%; }
  45% { transform: scale(1.08) translate3d(18px, -14px, 0); background-position: 72% 60%; }
  100% { transform: scale(1) translate3d(0, 0, 0); background-position: 0% 35%; }
`

export default function AdminChangePassword() {
  const toast = useToast()
  const cardBg = useColorModeValue('rgba(255,255,255,0.92)', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const pageGlow = useColorModeValue('rgba(255, 255, 255, 0.64)', 'rgba(9, 14, 26, 0.58)')
  const textMuted = useColorModeValue('gray.600', 'gray.300')

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const validate = () => {
    const nextErrors = {}

    if (!form.currentPassword.trim()) nextErrors.currentPassword = 'Current password is required'
    if (!form.newPassword.trim()) {
      nextErrors.newPassword = 'New password is required'
    } else if (!strongPasswordRegex.test(form.newPassword)) {
      nextErrors.newPassword = 'Must be 8+ chars with upper, lower, number'
    }

    if (!form.confirmPassword.trim()) {
      nextErrors.confirmPassword = 'Please confirm your new password'
    } else if (form.newPassword !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match'
    }

    if (form.currentPassword && form.newPassword && form.currentPassword === form.newPassword) {
      nextErrors.newPassword = 'New password must be different from current password'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const onSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    try {
      await changeAdminPassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })

      toast({
        title: 'Password changed',
        description: 'Your admin password has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setErrors({})
    } catch (error) {
      toast({
        title: 'Failed to change password',
        description: error?.response?.data?.error || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      pt={{ base: '120px', md: '75px' }}
      position="relative"
      overflow="hidden"
      minH="calc(100vh - 120px)"
      bgGradient="linear(to-br, #f7f4ef 0%, #fbfaf7 42%, #f3efe9 100%)"
    >
      <Box
        aria-hidden="true"
        position="absolute"
        inset="-20% -10%"
        bg={`radial-gradient(circle at 18% 20%, rgba(168, 85, 247, 0.18) 0%, transparent 26%),
          radial-gradient(circle at 82% 16%, rgba(56, 189, 248, 0.16) 0%, transparent 22%),
          radial-gradient(circle at 52% 82%, rgba(251, 146, 60, 0.12) 0%, transparent 24%),
          linear-gradient(135deg, ${pageGlow} 0%, rgba(255,255,255,0.05) 100%)`}
        bgSize="180% 180%"
        animation={`${panZoom} 24s ease-in-out infinite`}
        filter="blur(8px)"
        opacity={0.9}
        pointerEvents="none"
      />

      <Box
        aria-hidden="true"
        position="absolute"
        top="10%"
        left={{ base: '-8%', md: '2%' }}
        w={{ base: '180px', md: '280px' }}
        h={{ base: '180px', md: '280px' }}
        borderRadius="full"
        bg="rgba(168, 85, 247, 0.16)"
        filter="blur(24px)"
        animation={`${driftX} 12s ease-in-out infinite`}
        pointerEvents="none"
      />

      <Box
        aria-hidden="true"
        position="absolute"
        bottom={{ base: '12%', md: '8%' }}
        right={{ base: '-6%', md: '3%' }}
        w={{ base: '220px', md: '320px' }}
        h={{ base: '220px', md: '320px' }}
        borderRadius="full"
        bg="rgba(56, 189, 248, 0.14)"
        filter="blur(28px)"
        animation={`${driftY} 14s ease-in-out infinite`}
        pointerEvents="none"
      />

      <Box position="relative" zIndex={1} maxW="760px" mx="auto" px={{ base: 4, md: 6 }}>
        <Box
          bg={cardBg}
          borderColor={borderColor}
          borderWidth="1px"
          borderRadius="2xl"
          p={{ base: 5, md: 7 }}
          shadow="xl"
          position="relative"
          overflow="hidden"
          backdropFilter="blur(12px)"
        >
          <Box
            position="absolute"
            inset={0}
            pointerEvents="none"
            bg="linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 38%, rgba(255,255,255,0.1) 100%)"
          />

          <Box position="relative" zIndex={1}>
            <Heading size="md" mb={2}>
              Change Admin Password
            </Heading>
            <Text fontSize="sm" color={textMuted} mb={6}>
              Update your admin login password. The motion around this card is intentionally lightweight
              so the form stays responsive while you type.
            </Text>

            <FormControl isInvalid={!!errors.currentPassword} mb={4}>
              <FormLabel>Current Password</FormLabel>
              <InputGroup>
                <Input
                  type={showCurrent ? 'text' : 'password'}
                  value={form.currentPassword}
                  onChange={(e) => setForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                />
                <InputRightElement>
                  <Button variant="ghost" size="sm" onClick={() => setShowCurrent((v) => !v)}>
                    {showCurrent ? <ViewOffIcon /> : <ViewIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{errors.currentPassword}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.newPassword} mb={4}>
              <FormLabel>New Password</FormLabel>
              <InputGroup>
                <Input
                  type={showNew ? 'text' : 'password'}
                  value={form.newPassword}
                  onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                />
                <InputRightElement>
                  <Button variant="ghost" size="sm" onClick={() => setShowNew((v) => !v)}>
                    {showNew ? <ViewOffIcon /> : <ViewIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{errors.newPassword}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.confirmPassword} mb={6}>
              <FormLabel>Confirm New Password</FormLabel>
              <InputGroup>
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                />
                <InputRightElement>
                  <Button variant="ghost" size="sm" onClick={() => setShowConfirm((v) => !v)}>
                    {showConfirm ? <ViewOffIcon /> : <ViewIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
            </FormControl>

            <Button colorScheme="purple" onClick={onSubmit} isLoading={loading} loadingText="Updating...">
              Change Password
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
