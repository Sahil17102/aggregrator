import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Switch,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { usePaymentOptions, useUpdatePaymentOptions } from 'hooks/usePaymentOptions'
import { useEffect, useState } from 'react'
import { FiSave } from 'react-icons/fi'

export default function PaymentOptionsSettings() {
  const { data: paymentOptions, isLoading } = usePaymentOptions()
  const updatePaymentOptions = useUpdatePaymentOptions()
  const toast = useToast()

  const [formData, setFormData] = useState({
    codEnabled: true,
    prepaidEnabled: true,
    minWalletRecharge: 0,
    insuranceChargeEnabled: false,
    insuranceChargeThreshold: 2000,
    insuranceChargeBaseAmount: 5,
    insuranceChargePercentage: 0.5,
  })

  useEffect(() => {
    if (paymentOptions?.settings) {
      setFormData({
        codEnabled: paymentOptions.settings.codEnabled ?? true,
        prepaidEnabled: paymentOptions.settings.prepaidEnabled ?? true,
        minWalletRecharge: paymentOptions.settings.minWalletRecharge ?? 0,
        insuranceChargeEnabled: paymentOptions.settings.insuranceChargeEnabled ?? false,
        insuranceChargeThreshold: paymentOptions.settings.insuranceChargeThreshold ?? 2000,
        insuranceChargeBaseAmount: paymentOptions.settings.insuranceChargeBaseAmount ?? 5,
        insuranceChargePercentage: paymentOptions.settings.insuranceChargePercentage ?? 0.5,
      })
    } else if (paymentOptions) {
      // Handle direct response format
      setFormData({
        codEnabled: paymentOptions.codEnabled ?? true,
        prepaidEnabled: paymentOptions.prepaidEnabled ?? true,
        minWalletRecharge: paymentOptions.minWalletRecharge ?? 0,
        insuranceChargeEnabled: paymentOptions.insuranceChargeEnabled ?? false,
        insuranceChargeThreshold: paymentOptions.insuranceChargeThreshold ?? 2000,
        insuranceChargeBaseAmount: paymentOptions.insuranceChargeBaseAmount ?? 5,
        insuranceChargePercentage: paymentOptions.insuranceChargePercentage ?? 0.5,
      })
    }
  }, [paymentOptions])

  const handleToggle = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleSave = () => {
    const payload = {
      codEnabled: formData.codEnabled,
      prepaidEnabled: formData.prepaidEnabled,
      minWalletRecharge:
        formData.minWalletRecharge && Number(formData.minWalletRecharge) >= 0
          ? Number(formData.minWalletRecharge)
          : 0,
      insuranceChargeEnabled: formData.insuranceChargeEnabled,
      insuranceChargeThreshold:
        formData.insuranceChargeThreshold && Number(formData.insuranceChargeThreshold) >= 0
          ? Number(formData.insuranceChargeThreshold)
          : 0,
      insuranceChargeBaseAmount:
        formData.insuranceChargeBaseAmount && Number(formData.insuranceChargeBaseAmount) >= 0
          ? Number(formData.insuranceChargeBaseAmount)
          : 0,
      insuranceChargePercentage:
        formData.insuranceChargePercentage && Number(formData.insuranceChargePercentage) >= 0
          ? Number(formData.insuranceChargePercentage)
          : 0,
    }

    updatePaymentOptions.mutate(payload, {
      onSuccess: () => {
        toast({
          title: 'Payment options updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      },
      onError: (error) => {
        toast({
          title: 'Failed to update payment options',
          description: error?.response?.data?.error || 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      },
    })
  }

  // All hooks must be called before any conditional returns
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const grayBg = useColorModeValue('gray.50', 'gray.700')

  if (isLoading) {
    return (
      <Box pt={{ base: '120px', md: '75px' }}>
        <Text>Loading...</Text>
      </Box>
    )
  }

  return (
    <Box pt={{ base: '120px', md: '75px' }}>
      <Box
        bg={cardBg}
        borderColor={borderColor}
        borderWidth="1px"
        borderRadius="lg"
        p={6}
        shadow="md"
      >
        <Box mb={6}>
          <Heading size="md" mb={2}>
            Payment Options Settings
          </Heading>
          <Text fontSize="sm" color="gray.500">
            Control which payment options are available to the merchant in the client forms (orders,
            rate cards, calculators)
          </Text>
        </Box>
        <Box mb={6}>
          <Flex
            justify="space-between"
            align="center"
            mb={4}
            p={4}
            bg={grayBg}
            borderRadius="md"
          >
            <Box>
              <Text fontWeight="semibold" mb={1}>
                Cash on Delivery (COD)
              </Text>
              <Text fontSize="sm" color="gray.500">
                Enable or disable COD payment option in client forms
              </Text>
            </Box>
            <Switch
              isChecked={formData.codEnabled}
              onChange={() => handleToggle('codEnabled')}
              colorScheme="purple"
              size="lg"
            />
          </Flex>

          <Flex
            justify="space-between"
            align="center"
            p={4}
            bg={grayBg}
            borderRadius="md"
          >
            <Box>
              <Text fontWeight="semibold" mb={1}>
                Prepaid
              </Text>
              <Text fontSize="sm" color="gray.500">
                Enable or disable Prepaid payment option in client forms
              </Text>
            </Box>
            <Switch
              isChecked={formData.prepaidEnabled}
              onChange={() => handleToggle('prepaidEnabled')}
              colorScheme="purple"
              size="lg"
            />
          </Flex>

          <Flex
            justify="space-between"
            align="center"
            mt={4}
            p={4}
            bg={grayBg}
            borderRadius="md"
            gap={4}
          >
            <Box flex="1">
              <Text fontWeight="semibold" mb={1}>
                Minimum Wallet Recharge (INR)
              </Text>
              <Text fontSize="sm" color="gray.500">
                Set the minimum amount users must add when recharging their wallet. Set to 0 for no
                minimum.
              </Text>
            </Box>
            <Box width="150px">
              <Input
                type="number"
                min={0}
                step={100}
                value={formData.minWalletRecharge}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    minWalletRecharge: e.target.value === '' ? '' : Number(e.target.value),
                  }))
                }
                placeholder="0"
              />
            </Box>
          </Flex>

          <Box mt={4} p={4} bg={grayBg} borderRadius="md">
            <Flex justify="space-between" align="center" gap={4}>
              <Box flex="1">
                <Text fontWeight="semibold" mb={1}>
                  Insurance Charge
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Add a separate insurance charge to shipment wallet deductions. This does not need
                  to appear in the label or invoice.
                </Text>
              </Box>
              <Switch
                isChecked={formData.insuranceChargeEnabled}
                onChange={() => handleToggle('insuranceChargeEnabled')}
                colorScheme="purple"
                size="lg"
              />
            </Flex>

            <Flex mt={4} gap={4} direction={{ base: 'column', md: 'row' }}>
              <Box flex="1">
                <Text fontWeight="semibold" mb={1}>
                  Threshold Value (INR)
                </Text>
                <Text fontSize="sm" color="gray.500" mb={2}>
                  Orders up to this value use the flat amount.
                </Text>
                <Input
                  type="number"
                  min={0}
                  step={100}
                  value={formData.insuranceChargeThreshold}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      insuranceChargeThreshold: e.target.value === '' ? '' : Number(e.target.value),
                    }))
                  }
                  placeholder="2000"
                />
              </Box>

              <Box flex="1">
                <Text fontWeight="semibold" mb={1}>
                  Flat Charge Up To Threshold (INR)
                </Text>
                <Text fontSize="sm" color="gray.500" mb={2}>
                  Example: up to Rs. 2000, charge Rs. 5.
                </Text>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.insuranceChargeBaseAmount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      insuranceChargeBaseAmount:
                        e.target.value === '' ? '' : Number(e.target.value),
                    }))
                  }
                  placeholder="5"
                />
              </Box>

              <Box flex="1">
                <Text fontWeight="semibold" mb={1}>
                  Percentage Above Threshold
                </Text>
                <Text fontSize="sm" color="gray.500" mb={2}>
                  Example: above Rs. 2000, charge 0.5 percent on the excess value.
                </Text>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.insuranceChargePercentage}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      insuranceChargePercentage:
                        e.target.value === '' ? '' : Number(e.target.value),
                    }))
                  }
                  placeholder="0.5"
                />
              </Box>
            </Flex>
          </Box>
        </Box>

        <Flex justify="flex-end" gap={3}>
          <Button
            onClick={handleSave}
            leftIcon={<FiSave />}
            colorScheme="purple"
            isLoading={updatePaymentOptions.isPending}
            loadingText="Saving..."
          >
            Save Changes
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}
