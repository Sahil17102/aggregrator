import { Badge, Flex, Icon, Stack, Text } from '@chakra-ui/react'
import { FiCopy, FiMapPin } from 'react-icons/fi'
import { getCourierDisplayName } from 'utils/courierDisplay'
import { GenericTable } from 'views/Dashboard/Tables/components/GenericTable'

const statusColors = {
  pending: 'orange',
  booked: 'cyan',
  shipment_created: 'blue',
  pickup_initiated: 'blue',
  in_transit: 'purple',
  out_for_delivery: 'cyan',
  delivered: 'green',
  cancelled: 'gray',
  cancellation_requested: 'yellow',
  rto: 'orange',
  rto_in_transit: 'purple',
  rto_delivered: 'red',
}

const formatStatus = (value) => {
  if (!value) return 'N/A'
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const formatDate = (value) => {
  if (!value) return 'N/A'
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const OrdersTable = ({
  orders,
  totalCount,
  page,
  setPage,
  perPage,
  setPerPage,
  loading = false,
}) => {
  const captions = ['Order', 'Status', 'Type', 'Destination', 'Provider', 'AWB', 'Charge', 'Created']
  const columnKeys = [
    'order_summary',
    'order_status',
    'order_type',
    'destination',
    'courier_partner',
    'awb_number',
    'order_amount',
    'order_date',
  ]

  const renderers = {
    order_summary: (_value, row) => (
      <Stack spacing={1}>
        <Text fontWeight="800" fontSize="lg" color="inherit">
          {row.order_number || row.order_id || row.id || 'N/A'}
        </Text>
        <Text color="gray.500" fontSize="sm">
          {row.buyer_name || row.merchantName || row.merchantEmail || 'N/A'}
        </Text>
      </Stack>
    ),
    order_status: (value) => (
      <Badge
        colorScheme={statusColors[value] || 'gray'}
        fontSize="sm"
        px={2.5}
        py={1}
        borderRadius="8px"
        textTransform="none"
      >
        {formatStatus(value)}
      </Badge>
    ),
    order_type: (value, row) => (
      <Stack spacing={1} align="flex-start">
        <Badge colorScheme="purple" fontSize="sm" px={2.5} py={1} borderRadius="8px">
          {(row.shipping_mode || 'B2C').toUpperCase()}
        </Badge>
        <Badge colorScheme={value === 'cod' ? 'green' : 'green'} fontSize="xs" px={2.5} py={1} borderRadius="8px">
          {(value || 'prepaid').toUpperCase()}
        </Badge>
      </Stack>
    ),
    destination: (_value, row) => (
      <Flex align="center" gap={2} minW="220px">
        <Icon as={FiMapPin} color="gray.500" />
        <Text fontWeight="600">
          {[row.buyer_city, row.buyer_state].filter(Boolean).join(', ') || row.destination || 'N/A'}
        </Text>
      </Flex>
    ),
    courier_partner: (value, row) =>
      value ? (
        <Badge bg="rgba(249, 115, 22, 0.14)" color="#F97316" borderRadius="8px" px={2.5} py={1} textTransform="none">
          {getCourierDisplayName(
            {
              name: value,
              courier_id: row?.courier_id,
              integration_type: row?.integration_type,
            },
            'Not Assigned',
          )}
        </Badge>
      ) : (
        <Text color="gray.500">Not Assigned</Text>
      ),
    awb_number: (value) => (
      <Flex align="center" gap={2}>
        <Text as="span" fontFamily="mono" fontSize="sm">
          {value || 'N/A'}
        </Text>
        {value ? (
          <Icon
            as={FiCopy}
            cursor="pointer"
            color="gray.500"
            _hover={{ color: '#6C5CE7' }}
            onClick={() => navigator.clipboard.writeText(value)}
          />
        ) : null}
      </Flex>
    ),
    order_amount: (value) => (
      <Text fontWeight="800" fontSize="lg">
        ₹{parseFloat(value || 0).toFixed(2)}
      </Text>
    ),
    order_date: (value) => (
      <Text color="gray.500" fontSize="lg">
        {formatDate(value)}
      </Text>
    ),
  }

  return (
    <GenericTable
      title={null}
      data={orders || []}
      captions={captions}
      columnKeys={columnKeys}
      renderers={renderers}
      loading={loading}
      paginated
      page={page}
      setPage={setPage}
      totalCount={totalCount}
      perPage={perPage}
      setPerPage={setPerPage}
      perPageOptions={[10, 20, 50, 100]}
      columnWidths={{
        order_summary: '260px',
        order_status: '180px',
        order_type: '120px',
        destination: '280px',
        courier_partner: '180px',
        awb_number: '180px',
        order_amount: '120px',
        order_date: '140px',
      }}
    />
  )
}

export default OrdersTable
