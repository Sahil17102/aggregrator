import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import TrackingDetails from 'components/Tools/OrderTracking/TrackingDetails'
import { useTracking } from 'hooks/useTracking'
import { useEffect, useState } from 'react'
import { FiMail, FiPhone, FiSearch } from 'react-icons/fi'
import { useLocation } from 'react-router-dom'

const tabs = [
  { key: 'order', label: 'Order ID' },
  { key: 'awb', label: 'AWB' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
]

export default function OrderTrackingPage() {
  const location = useLocation()
  const [mode, setMode] = useState('order')
  const [query, setQuery] = useState('')
  const trackingMutation = useTracking()

  const panelBg = useColorModeValue('#FFFFFF', '#161B22')
  const borderColor = useColorModeValue('#E2E8F0', '#30363D')
  const textColor = useColorModeValue('#0F172A', '#E6EDF3')
  const mutedColor = useColorModeValue('#64748B', '#8B949E')
  const tabBg = useColorModeValue('#F9FAFB', '#0D1117')

  const placeholder =
    mode === 'awb'
      ? 'Enter AWB'
      : mode === 'email'
        ? 'Enter email'
        : mode === 'phone'
          ? 'Enter phone'
          : 'Enter Order ID'

  const canSubmit = query.trim().length > 2

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSubmit) return
    await trackingMutation.mutateAsync({
      awb: mode === 'awb' ? query.trim() : null,
      order: mode === 'order' ? query.trim() : null,
      contact: mode === 'email' || mode === 'phone' ? query.trim() : null,
    })
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const awb = params.get('awb')
    if (awb) {
      setMode('awb')
      setQuery(awb)
    }
  }, [location.search])

  return (
    <Flex direction="column" pt={{ base: '100px', md: '92px' }} gap={6}>
      <Card bg={panelBg} borderWidth="1px" borderColor={borderColor} borderRadius="20px" p="26px" boxShadow="none">
        <HStack spacing={4}>
          <Flex w="46px" h="46px" borderRadius="14px" bg="rgba(108, 92, 231, 0.16)" align="center" justify="center">
            <Icon as={FiSearch} color="#6C5CE7" boxSize={5} />
          </Flex>
          <Box>
            <Text color={textColor} fontSize="22px" fontWeight="800">
              Order Tracking
            </Text>
            <Text color={mutedColor} fontSize="15px">
              Track any shipment by Order ID, AWB number, email, or phone
            </Text>
          </Box>
        </HStack>
      </Card>

      <Card bg={panelBg} borderWidth="1px" borderColor={borderColor} borderRadius="20px" p="26px" boxShadow="none">
        <form onSubmit={handleSubmit}>
          <Stack spacing={5} align="stretch" maxW="780px">
            <HStack spacing={0} bg={tabBg} borderRadius="8px" p="3px" alignSelf="flex-start">
              {tabs.map((tab) => (
                <Button
                  key={tab.key}
                  size="sm"
                  variant="ghost"
                  bg={mode === tab.key ? '#26334a' : 'transparent'}
                  color={mode === tab.key ? textColor : mutedColor}
                  _hover={{ bg: mode === tab.key ? '#26334a' : 'rgba(108, 92, 231, 0.08)' }}
                  onClick={() => {
                    setMode(tab.key)
                    setQuery('')
                  }}
                >
                  {tab.label}
                </Button>
              ))}
            </HStack>

            <HStack spacing={4} align="center">
              <InputGroup flex="1">
                <InputLeftElement pointerEvents="none">
                  <Icon as={mode === 'email' ? FiMail : mode === 'phone' ? FiPhone : FiSearch} color={mutedColor} />
                </InputLeftElement>
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={placeholder}
                  bg={panelBg}
                  borderColor={borderColor}
                  color={textColor}
                  _placeholder={{ color: '#6E7681' }}
                  h="50px"
                  fontSize="20px"
                />
              </InputGroup>
              <Button
                type="submit"
                h="50px"
                px="22px"
                isDisabled={!canSubmit || trackingMutation.isPending}
                isLoading={trackingMutation.isPending}
                bg="#30363D"
                color={mutedColor}
                _hover={{ bg: '#3f4652' }}
              >
                Track
              </Button>
            </HStack>
          </Stack>
        </form>
      </Card>

      {trackingMutation.isSuccess ? (
        <TrackingDetails
          isLoading={trackingMutation?.isPending}
          data={trackingMutation?.data}
          error={trackingMutation?.isError}
        />
      ) : null}
    </Flex>
  )
}
