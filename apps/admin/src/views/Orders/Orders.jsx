import {
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
  useToast,
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import OrdersTable from 'components/Tables/OrdersTable'
import { useOrders } from 'hooks/useOrders'
import { useEffect, useMemo, useState } from 'react'
import { FiChevronDown, FiDownload, FiPackage, FiPlus, FiSearch } from 'react-icons/fi'
import { useLocation } from 'react-router-dom'
import { exportOrdersToCSV } from 'services/order.service'

const Orders = () => {
  const location = useLocation()
  const initialSearch = new URLSearchParams(location.search).get('search') || ''
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [filters, setFilters] = useState({
    status: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
    search: initialSearch,
    fromDate: '',
    toDate: '',
  })
  const [isExporting, setIsExporting] = useState(false)

  const { data: ordersData, isLoading, isFetching } = useOrders(page, limit, filters)
  const toast = useToast()

  useEffect(() => {
    const nextSearch = new URLSearchParams(location.search).get('search') || ''
    setFilters((prev) => (prev.search === nextSearch ? prev : { ...prev, search: nextSearch }))
    setPage(1)
  }, [location.search])

  const panelBg = useColorModeValue('#FFFFFF', '#161B22')
  const borderColor = useColorModeValue('#E2E8F0', '#30363D')
  const textColor = useColorModeValue('#0F172A', '#E6EDF3')
  const mutedColor = useColorModeValue('#64748B', '#8B949E')
  const inputBg = useColorModeValue('#FFFFFF', '#161B22')
  const totalCount = ordersData?.totalCount || 0

  const stats = useMemo(() => {
    const orders = ordersData?.orders || []
    return {
      total: totalCount,
      inTransit: orders.filter((o) => ['shipment_created', 'in_transit', 'pickup_initiated'].includes(o.order_status)).length,
      delivered: orders.filter((o) => o.order_status === 'delivered').length,
      cancelled: orders.filter((o) => o.order_status === 'cancelled').length,
      rto: orders.filter((o) => String(o.order_status || '').includes('rto')).length,
      revenue: orders.reduce((sum, order) => sum + Number(order.order_amount || 0), 0),
    }
  }, [ordersData, totalCount])

  const handleExport = async () => {
    try {
      setIsExporting(true)
      await exportOrdersToCSV(filters)
      toast({ title: 'Orders exported', status: 'success', duration: 2500, isClosable: true })
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error.message || 'Failed to export orders',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsExporting(false)
    }
  }

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  return (
    <Box pt={{ base: '100px', md: '92px' }}>
      <Card bg={panelBg} borderColor={borderColor} borderWidth="1px" borderRadius="20px" p="26px" mb="20px" boxShadow="none">
        <Flex justify="space-between" align={{ base: 'flex-start', xl: 'center' }} gap={5} wrap="wrap">
          <HStack spacing={4}>
            <Flex w="46px" h="46px" borderRadius="14px" bg="rgba(108, 92, 231, 0.16)" align="center" justify="center">
              <Icon as={FiPackage} color="#6C5CE7" boxSize={5} />
            </Flex>
            <Box>
              <Text color={textColor} fontSize="22px" fontWeight="800">
                Orders
              </Text>
              <Text color={mutedColor} fontSize="15px">
                View and manage all orders across users
              </Text>
            </Box>
          </HStack>

          <HStack spacing={4} wrap="wrap" color={mutedColor}>
            <StatDot color="#6C5CE7" value={stats.total} label="total" />
            <StatDot color="#3B82F6" value={stats.inTransit} label="in transit" />
            <StatDot color="#10B981" value={stats.delivered} label="delivered" />
            <StatDot color="#F87171" value={stats.cancelled} label="cancelled" />
            <StatDot color="#F97316" value={stats.rto} label="RTO" />
            <Text color={textColor} fontWeight="800">
              ₹ {stats.revenue.toLocaleString('en-IN')}
              <Text as="span" color={mutedColor} fontWeight="400" ml={2}>
                revenue
              </Text>
            </Text>
          </HStack>
        </Flex>

        <Box h="1px" bg={borderColor} my="20px" />

        <Flex justify="space-between" align={{ base: 'stretch', lg: 'flex-end' }} gap={4} wrap="wrap">
          <Stack direction={{ base: 'column', md: 'row' }} spacing={4} flex="1">
            <Box minW={{ base: '100%', md: '300px' }}>
              <Text color={mutedColor} fontSize="14px" mb="8px">
                Search
              </Text>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color={mutedColor} />
                </InputLeftElement>
                <Input
                  value={filters.search}
                  onChange={(event) => updateFilter('search', event.target.value)}
                  placeholder="Order ID, AWB, name, city..."
                  bg={inputBg}
                  borderColor={borderColor}
                  color={textColor}
                  _placeholder={{ color: '#6E7681' }}
                />
              </InputGroup>
            </Box>
            <Box minW={{ base: '100%', md: '200px' }}>
              <Text color={mutedColor} fontSize="14px" mb="8px">
                Status
              </Text>
              <Select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)} bg={inputBg} borderColor={borderColor} color={textColor}>
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="shipment_created">Shipment Created</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="rto_delivered">RTO Delivered</option>
              </Select>
            </Box>
            <Button variant="link" color="#6C5CE7" rightIcon={<FiChevronDown />} alignSelf={{ base: 'flex-start', md: 'flex-end' }}>
              More filters
            </Button>
          </Stack>

          <HStack spacing={4} justify="flex-end">
            <Text color={mutedColor} whiteSpace="nowrap">
              {totalCount} orders
            </Text>
            <Button leftIcon={<FiDownload />} variant="outline" borderColor={borderColor} color={textColor} isLoading={isExporting} onClick={handleExport}>
              Export CSV
            </Button>
            <Button leftIcon={<FiPlus />} bg="#6C5CE7" color="white" _hover={{ bg: '#5A4BD1' }}>
              Create Manual Order
            </Button>
          </HStack>
        </Flex>
      </Card>

      <OrdersTable
        orders={ordersData?.orders}
        totalCount={totalCount}
        page={page}
        setPage={setPage}
        perPage={limit}
        setPerPage={setLimit}
        loading={isLoading || isFetching}
      />
    </Box>
  )
}

function StatDot({ color, value, label }) {
  return (
    <HStack spacing={1.5}>
      <Box w="14px" h="14px" borderRadius="4px" border="2px solid" borderColor={color} />
      <Text color="#E6EDF3" fontWeight="800">
        {value}
      </Text>
      <Text color="#8B949E">{label}</Text>
    </HStack>
  )
}

export default Orders
