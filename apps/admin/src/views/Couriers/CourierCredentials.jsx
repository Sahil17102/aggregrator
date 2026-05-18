import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Spinner,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useCourierCredentials, useUpdateDeliveryOneCredentials } from 'hooks/useCouriers'

const CourierCredentials = () => {
  const toast = useToast()
  const { data, isLoading, error } = useCourierCredentials()
  const updateDeliveryOne = useUpdateDeliveryOneCredentials()

  const [deliveryOneForm, setDeliveryOneForm] = useState({
    apiBase: '',
    clientId: '',
    username: '',
    password: '',
    apiKey: '',
    webhookSecret: '',
  })

  useEffect(() => {
    if (data?.deliveryOne) {
      setDeliveryOneForm({
        apiBase: data.deliveryOne.apiBase || '',
        clientId: data.deliveryOne.clientId || '',
        username: data.deliveryOne.username || '',
        password: '',
        apiKey: '',
        webhookSecret: '',
      })
    }
  }, [data])

  const handleSaveDeliveryOne = () => {
    updateDeliveryOne.mutate(
      {
        apiBase: deliveryOneForm.apiBase,
        clientId: deliveryOneForm.clientId,
        username: deliveryOneForm.username,
        ...(deliveryOneForm.password ? { password: deliveryOneForm.password } : {}),
        ...(deliveryOneForm.apiKey ? { apiKey: deliveryOneForm.apiKey } : {}),
        ...(deliveryOneForm.webhookSecret
          ? { webhookSecret: deliveryOneForm.webhookSecret }
          : {}),
      },
      {
        onSuccess: () => {
          toast({ title: 'Delivery One credentials updated', status: 'success' })
          setDeliveryOneForm((prev) => ({
            ...prev,
            password: '',
            apiKey: '',
            webhookSecret: '',
          }))
        },
        onError: (err) => {
          toast({
            title: 'Failed to update Delivery One credentials',
            description: err?.message,
            status: 'error',
          })
        },
      },
    )
  }

  if (isLoading) return <Spinner size="md" />
  if (error) return <Text color="red.500">Failed to load courier credentials</Text>

  return (
    <Flex direction="column" pt={{ base: '120px', md: '75px' }} gap={4}>
      <Text fontSize="xl" fontWeight="bold">
        Courier Credentials
      </Text>

      <Flex gap={4} flexWrap="wrap">
        <Box borderWidth="1px" borderRadius="lg" p={5} minW="320px" flex="1" maxW="520px">
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Text fontWeight="semibold">Delivery One</Text>
              <Badge colorScheme={data?.deliveryOne?.hasApiKey ? 'green' : 'orange'}>
                {data?.deliveryOne?.hasApiKey ? 'API key set' : 'Missing API key'}
              </Badge>
            </Flex>

            <FormControl>
              <FormLabel>API Base URL</FormLabel>
              <Input
                value={deliveryOneForm.apiBase}
                onChange={(e) =>
                  setDeliveryOneForm((prev) => ({ ...prev, apiBase: e.target.value }))
                }
                placeholder="https://track.delhivery.com"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Client ID</FormLabel>
              <Input
                value={deliveryOneForm.clientId}
                onChange={(e) =>
                  setDeliveryOneForm((prev) => ({ ...prev, clientId: e.target.value }))
                }
                placeholder="Delivery One client ID"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Username / Email</FormLabel>
              <Input
                value={deliveryOneForm.username}
                onChange={(e) =>
                  setDeliveryOneForm((prev) => ({ ...prev, username: e.target.value }))
                }
                placeholder="Delivery One username or email"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={deliveryOneForm.password}
                onChange={(e) =>
                  setDeliveryOneForm((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Leave blank to keep existing password"
              />
              {data?.deliveryOne?.hasPassword && (
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Password already configured on Delivery One.
                </Text>
              )}
            </FormControl>

            <FormControl>
              <FormLabel>API Key / Token</FormLabel>
              <Input
                type="password"
                value={deliveryOneForm.apiKey}
                onChange={(e) =>
                  setDeliveryOneForm((prev) => ({ ...prev, apiKey: e.target.value }))
                }
                placeholder={data?.deliveryOne?.apiKeyMasked || 'Enter Delivery One API key'}
              />
              {!!data?.deliveryOne?.apiKeyMasked && (
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Current key: {data.deliveryOne.apiKeyMasked}
                </Text>
              )}
            </FormControl>

            <FormControl>
              <FormLabel>Webhook Secret</FormLabel>
              <Input
                type="password"
                value={deliveryOneForm.webhookSecret}
                onChange={(e) =>
                  setDeliveryOneForm((prev) => ({ ...prev, webhookSecret: e.target.value }))
                }
                placeholder="Leave blank to keep existing webhook secret"
              />
              {data?.deliveryOne?.hasWebhookSecret && (
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Webhook secret already configured on Delivery One.
                </Text>
              )}
            </FormControl>

            <Text fontSize="xs" color="gray.500">
              Delivery One is the only active courier integration. Leave password, API key, or
              webhook secret blank to keep the saved value.
            </Text>

            <Button
              colorScheme="blue"
              onClick={handleSaveDeliveryOne}
              isLoading={updateDeliveryOne.isPending}
              alignSelf="flex-start"
            >
              Save Delivery One Credentials
            </Button>
          </VStack>
        </Box>
      </Flex>
    </Flex>
  )
}

export default CourierCredentials
