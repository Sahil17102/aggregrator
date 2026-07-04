import {
  Badge,
  Box,
  Flex,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import { useAdminNdr } from 'hooks/useOps'
import { useEffect, useState } from 'react'
import { FiAlertTriangle, FiSearch } from 'react-icons/fi'
import { getAdminNdrKpis } from 'services/ops.service'
import { getCourierDisplayName } from 'utils/courierDisplay'
import { GenericTable } from 'views/Dashboard/Tables/components/GenericTable'

export default function AdminNdr() {
  const [filters, setFilters] = useState({ search: '' })
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [kpis, setKpis] = useState(null)

  const { data, isLoading } = useAdminNdr({
    page,
    limit: perPage,
    search: filters.search,
  })
  const rows = data?.data || []
  const totalCount = data?.totalCount || 0

  const panelBg = useColorModeValue('#FFFFFF', '#161B22')
  const borderColor = useColorModeValue('#E2E8F0', '#30363D')
  const textColor = useColorModeValue('#0F172A', '#E6EDF3')
  const mutedColor = useColorModeValue('#64748B', '#8B949E')

  useEffect(() => {
    ;(async () => {
      try {
        const resp = await getAdminNdrKpis()
        setKpis(resp?.data || null)
      } catch (e) {
        setKpis(null)
      }
    })()
  }, [])

  const updateSearch = (value) => {
    setFilters({ search: value })
    setPage(1)
  }

  const captions = ['Order ID', 'AWB', 'Customer', 'Destination', 'Courier', 'Amount', 'NDR Date', 'Actions']
  const columnKeys = [
    'order_id',
    'awb_number',
    'customer',
    'destination',
    'courier_partner',
    'amount',
    'last_event_time',
    'actions',
  ]

  return (
    <Flex direction="column" pt={{ base: '100px', md: '92px' }} gap={5}>
      <Card bg={panelBg} borderWidth="1px" borderColor={borderColor} borderRadius="20px" p="26px" boxShadow="none">
        <Flex justify="space-between" align="center" gap={4} wrap="wrap">
          <HStack spacing={4}>
            <Flex w="46px" h="46px" borderRadius="14px" bg="rgba(108, 92, 231, 0.16)" align="center" justify="center">
              <Icon as={FiAlertTriangle} color="#6C5CE7" boxSize={5} />
            </Flex>
            <Box>
              <Text color={textColor} fontSize="22px" fontWeight="800">
                NDR Management
              </Text>
              <Text color={mutedColor} fontSize="15px">
                Non-delivery reports - take action on failed deliveries
              </Text>
            </Box>
          </HStack>
          <HStack color={mutedColor}>
            <Icon as={FiAlertTriangle} color="#F87171" />
            <Text color={textColor} fontWeight="800">
              {kpis?.total ?? totalCount}
            </Text>
            <Text>Total NDR</Text>
          </HStack>
        </Flex>
      </Card>

      <InputGroup maxW="480px">
        <InputLeftElement pointerEvents="none">
          <Icon as={FiSearch} color={mutedColor} />
        </InputLeftElement>
        <Input
          value={filters.search}
          onChange={(event) => updateSearch(event.target.value)}
          placeholder="Search by order ID, AWB, customer..."
          bg={panelBg}
          borderColor={borderColor}
          color={textColor}
          _placeholder={{ color: '#6E7681' }}
        />
      </InputGroup>

      <GenericTable
        title={null}
        paginated
        loading={isLoading}
        page={page}
        setPage={setPage}
        totalCount={totalCount}
        perPage={perPage}
        setPerPage={setPerPage}
        data={rows}
        captions={captions}
        columnKeys={columnKeys}
        renderers={{
          order_id: (value, row) => (
            <Text fontWeight="800">{row.order_number || value || row.order_id || 'N/A'}</Text>
          ),
          customer: (_value, row) => (
            <Text fontWeight="600">{row.buyer_name || row.customer_name || row.merchant_name || 'N/A'}</Text>
          ),
          destination: (_value, row) => (
            <Text fontWeight="600">{[row.buyer_city, row.buyer_state].filter(Boolean).join(', ') || row.destination || 'N/A'}</Text>
          ),
          courier_partner: (value, row) => (
            <Text fontWeight="600">
              {getCourierDisplayName({ name: value, courier_id: row?.courier_id, integration_type: row?.integration_type }, 'N/A')}
            </Text>
          ),
          amount: (_value, row) => (
            <Text fontWeight="800" fontSize="lg">
              ₹{Number(row.order_amount || row.amount || 0).toFixed(2)}
            </Text>
          ),
          last_event_time: (value) => (
            <Text color={mutedColor}>{value ? new Date(value).toLocaleDateString('en-IN') : 'N/A'}</Text>
          ),
          actions: () => (
            <Badge borderRadius="8px" px={2.5} py={1} colorScheme="gray" textTransform="none">
              No action
            </Badge>
          ),
        }}
      />
    </Flex>
  )
}
