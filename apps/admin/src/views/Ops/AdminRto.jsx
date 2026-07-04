import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import { useAdminRto, useAdminRtoKpis } from 'hooks/useOps'
import { useState } from 'react'
import { FiRefreshCw, FiRotateCcw, FiSearch } from 'react-icons/fi'
import { getCourierDisplayName } from 'utils/courierDisplay'
import { GenericTable } from 'views/Dashboard/Tables/components/GenericTable'

export default function AdminRto() {
  const [filters, setFilters] = useState({ search: '', status: '' })
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)

  const { data, isLoading } = useAdminRto({
    page,
    limit: perPage,
    search: filters.search,
    status: filters.status || undefined,
  })
  const { data: kpisData } = useAdminRtoKpis({ search: filters.search })
  const rows = data?.data || []
  const totalCount = data?.totalCount || 0

  const panelBg = useColorModeValue('#FFFFFF', '#161B22')
  const borderColor = useColorModeValue('#E2E8F0', '#30363D')
  const textColor = useColorModeValue('#0F172A', '#E6EDF3')
  const mutedColor = useColorModeValue('#64748B', '#8B949E')

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const captions = ['Order ID', 'AWB', 'RTO Phase', 'Customer', 'Courier', 'Amount', 'Actions']
  const columnKeys = ['order_id', 'awb_number', 'status', 'customer', 'courier_partner', 'rto_charges', 'actions']

  return (
    <Flex direction="column" pt={{ base: '100px', md: '92px' }} gap={5}>
      <Card bg={panelBg} borderWidth="1px" borderColor={borderColor} borderRadius="20px" p="26px" boxShadow="none">
        <Flex justify="space-between" align="center" gap={4} wrap="wrap">
          <HStack spacing={4}>
            <Flex w="46px" h="46px" borderRadius="14px" bg="rgba(108, 92, 231, 0.16)" align="center" justify="center">
              <Icon as={FiRotateCcw} color="#6C5CE7" boxSize={5} />
            </Flex>
            <Box>
              <Text color={textColor} fontSize="22px" fontWeight="800">
                RTO Management
              </Text>
              <Text color={mutedColor} fontSize="15px">
                Return to origin - track and manage returned shipments
              </Text>
            </Box>
          </HStack>
          <HStack color={mutedColor}>
            <Icon as={FiRefreshCw} color="#F97316" />
            <Text color={textColor} fontWeight="800">
              {kpisData?.data?.total ?? totalCount}
            </Text>
            <Text>Total RTO</Text>
          </HStack>
        </Flex>
      </Card>

      <HStack spacing={4} align="center">
        <InputGroup maxW="400px">
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color={mutedColor} />
          </InputLeftElement>
          <Input
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
            placeholder="Search by order ID, AWB, customer..."
            bg={panelBg}
            borderColor={borderColor}
            color={textColor}
            _placeholder={{ color: '#6E7681' }}
          />
        </InputGroup>
        <Select
          maxW="200px"
          value={filters.status}
          onChange={(event) => updateFilter('status', event.target.value)}
          bg={panelBg}
          borderColor={borderColor}
          color={textColor}
        >
          <option value="">All Phases</option>
          <option value="delivered">Delivered</option>
          <option value="rto">RTO</option>
          <option value="rto_delivered">RTO Delivered</option>
        </Select>
      </HStack>

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
          status: (value) => (
            <Badge colorScheme="red" borderRadius="8px" px={2.5} py={1} textTransform="none">
              {String(value || 'Delivered').replace(/_/g, ' ')}
            </Badge>
          ),
          customer: (_value, row) => (
            <Text fontWeight="600">{row.buyer_name || row.customer_name || row.customer || 'N/A'}</Text>
          ),
          courier_partner: (value, row) => (
            <Text fontWeight="600">
              {getCourierDisplayName({ name: value, courier_id: row?.courier_id, integration_type: row?.integration_type }, 'N/A')}
            </Text>
          ),
          rto_charges: (value, row) => (
            <Text fontWeight="800" fontSize="lg">
              ₹{Number(value || row.order_amount || 0).toFixed(2)}
            </Text>
          ),
          actions: () => (
            <Button size="sm" variant="outline" borderColor={borderColor} color={mutedColor}>
              Completed
            </Button>
          ),
        }}
      />
    </Flex>
  )
}
