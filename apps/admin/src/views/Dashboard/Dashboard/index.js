import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Grid,
  HStack,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react'
import {
  IconAlertTriangle,
  IconBuildingBank,
  IconChartBar,
  IconCoinRupee,
  IconExternalLink,
  IconPackageExport,
  IconRefresh,
  IconTruck,
  IconUsers,
  IconWallet,
} from '@tabler/icons-react'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import CourierDistributionChart from 'components/Charts/CourierDistributionChart'
import OrdersLineChart from 'components/Charts/OrdersLineChart'
import RevenueBarChart from 'components/Charts/RevenueBarChart'
import { useDashboardStats } from 'hooks/useDashboardStats'
import { useHistory } from 'react-router-dom'

const ui = {
  page: '#0D1117',
  surface: '#161B22',
  surfaceMuted: '#21262D',
  border: '#30363D',
  borderSoft: 'rgba(48, 54, 61, 0.72)',
  text: '#E6EDF3',
  muted: '#8B949E',
  tertiary: '#6E7681',
  primary: '#6C5CE7',
  primaryBg: 'rgba(108, 92, 231, 0.14)',
  accent: '#F97316',
  accentBg: 'rgba(249, 115, 22, 0.14)',
  success: '#4ADE80',
  successBg: 'rgba(74, 222, 128, 0.14)',
  danger: '#F87171',
  dangerBg: 'rgba(248, 113, 113, 0.14)',
  blue: '#3B82F6',
  blueBg: 'rgba(59, 130, 246, 0.14)',
}

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0)

const toNum = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function EmptyState({ label = 'No data', h = '160px' }) {
  return (
    <Flex minH={h} align="center" justify="center" color={ui.muted} fontSize="sm">
      {label}
    </Flex>
  )
}

function Panel({ title, icon, badge, children, minH, gridColumn }) {
  return (
    <Card
      bg={ui.surface}
      borderWidth="1px"
      borderColor={ui.border}
      borderRadius="12px"
      boxShadow="none"
      overflow="hidden"
      p="0"
      minH={minH}
      gridColumn={gridColumn}
    >
      <CardHeader p={{ base: 4, md: 5 }} borderBottom="1px solid" borderColor={ui.borderSoft}>
        <HStack spacing={2.5}>
          {icon ? <Box color={icon.color}>{icon.node}</Box> : null}
          <Text color={ui.text} fontSize={{ base: 'md', md: 'lg' }} fontWeight="800">
            {title}
          </Text>
          {badge !== undefined ? (
            <Badge bg={ui.surfaceMuted} color={ui.text} border="1px solid" borderColor={ui.border} borderRadius="8px">
              {badge}
            </Badge>
          ) : null}
        </HStack>
      </CardHeader>
      <CardBody p={{ base: 4, md: 5 }}>{children}</CardBody>
    </Card>
  )
}

function MetricCard({ label, value, subtitle, trend, icon: Icon, color }) {
  const trendValue = toNum(trend)
  const hasTrend = trend !== undefined && trend !== null
  const trendColor = trendValue < 0 ? ui.danger : ui.success

  return (
    <Card
      bg={ui.surface}
      borderWidth="1px"
      borderColor={ui.border}
      borderRadius="12px"
      boxShadow="none"
      p="0"
      minH="120px"
    >
      <CardBody p={5}>
        <HStack justify="space-between" align="flex-start" spacing={4}>
          <Box minW={0}>
            <Text color={ui.muted} fontSize="sm" fontWeight="500">
              {label}
            </Text>
            <Text color={ui.text} fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800" lineHeight="1.1" mt={2}>
              {value}
            </Text>
            <HStack spacing={2} mt={2} minH="18px">
              {subtitle ? (
                <Text color={ui.muted} fontSize="sm">
                  {subtitle}
                </Text>
              ) : null}
              {hasTrend ? (
                <Text color={trendColor} fontSize="sm" fontWeight="700">
                  {trendValue > 0 ? '+' : ''}
                  {trendValue}%
                </Text>
              ) : null}
            </HStack>
          </Box>
          <Flex
            w="50px"
            h="50px"
            borderRadius="14px"
            align="center"
            justify="center"
            color={color}
            bg={`${color}1f`}
            flexShrink={0}
          >
            <Icon size={25} strokeWidth={1.9} />
          </Flex>
        </HStack>
      </CardBody>
    </Card>
  )
}

function StatusBars({ items }) {
  if (!items.length) return <EmptyState h="138px" />

  const maxCount = Math.max(...items.map((item) => item.count), 1)

  return (
    <Stack spacing={2}>
      {items.map((item) => (
        <HStack key={item.status} spacing={3}>
          <Text color={ui.muted} fontSize="xs" textAlign="right" w="112px" noOfLines={1}>
            {item.name}
          </Text>
          <Box flex="1" h="22px" bg="rgba(48, 54, 61, 0.42)" borderRadius="6px" overflow="hidden">
            <Box h="100%" minW="4px" w={`${Math.round((item.count / maxCount) * 100)}%`} bg={item.fill} />
          </Box>
          <Text color={ui.text} fontSize="xs" fontWeight="700" w="42px" textAlign="right">
            {item.count}
          </Text>
        </HStack>
      ))}
    </Stack>
  )
}

function ActionRow({ icon, label, count, route, tone = 'amber' }) {
  const history = useHistory()
  const toneStyle =
    tone === 'green'
      ? { bg: 'rgba(74, 222, 128, 0.13)', border: 'rgba(74, 222, 128, 0.16)', color: ui.success }
      : { bg: 'rgba(249, 115, 22, 0.12)', border: 'rgba(249, 115, 22, 0.18)', color: ui.accent }

  return (
    <Flex
      as="button"
      type="button"
      w="100%"
      align="center"
      justify="space-between"
      gap={3}
      p={3.5}
      borderRadius="10px"
      border="1px solid"
      borderColor={toneStyle.border}
      bg={toneStyle.bg}
      textAlign="left"
      onClick={() => history.push(route)}
      _hover={{ borderColor: toneStyle.color }}
    >
      <HStack spacing={3} minW={0}>
        <Box color={toneStyle.color}>{icon}</Box>
        <Text color={ui.text} fontWeight="700" noOfLines={1}>
          {label}
        </Text>
      </HStack>
      <HStack spacing={3}>
        <Badge color={toneStyle.color} bg="rgba(249, 115, 22, 0.16)" border="1px solid" borderColor={toneStyle.border}>
          {count}
        </Badge>
        <IconExternalLink size={14} color={ui.muted} />
      </HStack>
    </Flex>
  )
}

function RevenueTable({ rows }) {
  return (
    <Box borderTop="1px solid" borderColor={ui.border} pt={4}>
      <HStack spacing={7} mb={4}>
        <Text color={ui.primary} fontWeight="700" borderBottom="2px solid" borderColor={ui.primary} pb={3}>
          Breakdown
        </Text>
        <Text color={ui.text} fontWeight="700" pb={3}>
          Chart
        </Text>
      </HStack>
      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead bg="#1a2234">
            <Tr>
              {['Courier', 'Revenue', 'Cost', 'Margin', 'Margin %', 'Rev/Order'].map((head) => (
                <Th key={head} color={ui.muted} borderColor="transparent" textTransform="none" fontSize="sm" py={4}>
                  {head}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {rows.length ? (
              rows.map((row) => (
                <Tr key={row.courier}>
                  <Td color={ui.text} borderColor={ui.borderSoft}>{row.courier}</Td>
                  <Td color={ui.text} borderColor={ui.borderSoft}>{formatCurrency(row.revenue)}</Td>
                  <Td color={ui.text} borderColor={ui.borderSoft}>{formatCurrency(row.cost)}</Td>
                  <Td color={row.margin >= 0 ? ui.success : ui.danger} borderColor={ui.borderSoft}>
                    {formatCurrency(row.margin)}
                  </Td>
                  <Td color={ui.text} borderColor={ui.borderSoft}>{row.marginPercent}%</Td>
                  <Td color={ui.text} borderColor={ui.borderSoft}>{formatCurrency(row.revPerOrder)}</Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={6} borderColor={ui.borderSoft}>
                  <EmptyState h="172px" />
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  )
}

export default function Dashboard() {
  const { data: statsData, isLoading, error, refetch, isRefetching } = useDashboardStats()

  const stats = statsData?.data || {}
  const todayOps = stats.todayOperations || {}
  const yesterdayOps = stats.yesterdayOperations || {}
  const financial = stats.financial || {}
  const operational = stats.operational || {}
  const alerts = stats.alerts || {}
  const couriers = stats.couriers || {}
  const geographic = stats.geographic || {}
  const charts = stats.charts || {}
  const sellers = stats.sellers || {}

  const totalOrders = toNum(operational.totalOrders)
  const activeSellers = toNum(sellers.active || sellers.activeSellers || operational.activeSellers)
  const totalRevenue = toNum(financial.totalRevenue)
  const totalCost = toNum(financial.totalCost || financial.courierCost || financial.freightCost)
  const totalMargin = Number.isFinite(Number(financial.totalMargin))
    ? toNum(financial.totalMargin)
    : totalRevenue - totalCost
  const deliveryRate = toNum(operational.deliverySuccessRate || operational.deliveryRate)

  const ordersTrend =
    toNum(yesterdayOps.orders) > 0
      ? Math.round(((toNum(todayOps.orders) - toNum(yesterdayOps.orders)) / toNum(yesterdayOps.orders)) * 100)
      : totalOrders > 0
        ? 0
        : -100
  const revenueTrend = toNum(financial.revenueTrend ?? financial.revenueGrowth ?? (totalRevenue > 0 ? 0 : -100))

  const statusItems = [
    { status: 'pending', name: 'Pending', count: toNum(operational.pendingOrders || todayOps.pending), fill: ui.primary },
    { status: 'delivered', name: 'Delivered', count: toNum(operational.deliveredOrders), fill: ui.success },
    { status: 'ndr', name: 'NDR', count: toNum(operational.ndrOrders), fill: '#F59E0B' },
    { status: 'rto', name: 'RTO', count: toNum(operational.rtoOrders), fill: ui.danger },
  ].filter((item) => item.count > 0)

  const courierRows = Object.entries(couriers.performance || {}).map(([courier, value]) => ({
    courier,
    revenue: toNum(value?.revenue),
    cost: toNum(value?.cost),
    margin: toNum(value?.margin),
    marginPercent: toNum(value?.marginPercent),
    revPerOrder: toNum(value?.revPerOrder),
  }))

  const topCouriers = Object.entries(couriers.performance || {}).map(([name, value]) => ({
    name,
    count: toNum(value?.count),
    deliveryRate: toNum(value?.deliveryRate),
    revenue: toNum(value?.revenue),
  }))

  const topStates = geographic.topStates || geographic.topDestinationStates || []
  const prepaid = stats.paymentSplit?.prepaid || financial.paymentSplit?.prepaid || {}
  const cod = stats.paymentSplit?.cod || financial.paymentSplit?.cod || {}
  const bankApprovals = toNum(alerts.bankApprovalsPending || stats.compliance?.bankApprovalsPending)
  const codRemittances = toNum(alerts.codRemittancesPending || financial.codRemittancesPending)

  if (isLoading) {
    return (
      <Flex minH="70vh" align="center" justify="center" bg={ui.page}>
        <VStack spacing={4}>
          <Spinner size="xl" color={ui.primary} thickness="4px" />
          <Text color={ui.muted}>Loading dashboard...</Text>
        </VStack>
      </Flex>
    )
  }

  return (
    <Box minH="100vh" bg={ui.page} color={ui.text} pb={8}>
      <Container maxW="full" pt={{ base: '102px', md: '96px' }} px={{ base: 4, md: 6 }}>
        <Flex justify="space-between" align={{ base: 'flex-start', lg: 'flex-end' }} gap={4} mb={7} flexWrap="wrap">
          <Box>
            <Text color={ui.text} fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800" lineHeight="1.2">
              Dashboard
            </Text>
            <Text color={ui.muted} fontSize="md" mt={1}>
              Platform overview
            </Text>
          </Box>
          <HStack spacing={2} flexWrap="wrap">
            <Select value="30d" size="sm" w="124px" bg={ui.surface} borderColor={ui.border} color={ui.text}>
              <option value="30d">30 days</option>
            </Select>
            <Select value="all" size="sm" w="150px" bg={ui.surface} borderColor={ui.border} color={ui.muted}>
              <option value="all">All couriers</option>
            </Select>
            <Select value="all" size="sm" w="126px" bg={ui.surface} borderColor={ui.border} color={ui.muted}>
              <option value="all">Payment</option>
            </Select>
          </HStack>
        </Flex>

        {error ? (
          <Panel title="Dashboard data" minH="150px">
            <VStack spacing={3}>
              <Text color={ui.danger} fontWeight="700">Failed to load dashboard data</Text>
              <Button
                size="sm"
                leftIcon={<IconRefresh size={16} />}
                isLoading={isRefetching}
                onClick={() => refetch()}
                bg={ui.primary}
                color="white"
                _hover={{ bg: '#5A4BD1' }}
              >
                Retry
              </Button>
            </VStack>
          </Panel>
        ) : (
          <Stack spacing={6}>
            <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={4}>
              <MetricCard
                label="Orders (30d)"
                value={totalOrders.toLocaleString()}
                subtitle={`${toNum(todayOps.orders)} today`}
                trend={ordersTrend}
                icon={IconPackageExport}
                color={ui.primary}
              />
              <MetricCard label="Active Sellers" value={activeSellers.toLocaleString()} icon={IconUsers} color={ui.blue} />
              <MetricCard
                label="Revenue (30d)"
                value={formatCurrency(totalRevenue)}
                trend={revenueTrend}
                icon={IconCoinRupee}
                color={ui.success}
              />
              <MetricCard
                label="Delivery Rate"
                value={`${deliveryRate}%`}
                subtitle={operational.avgDeliveryDays ? `Avg ${operational.avgDeliveryDays}d` : undefined}
                icon={IconTruck}
                color={ui.accent}
              />
            </SimpleGrid>

            <Grid templateColumns={{ base: '1fr', xl: '2fr 1fr' }} gap={5}>
              <Panel
                title="Orders by Status (30d)"
                badge={statusItems.reduce((sum, item) => sum + item.count, 0)}
                icon={{ node: <IconPackageExport size={18} />, color: ui.primary }}
                minH="258px"
              >
                <StatusBars items={statusItems} />
              </Panel>
              <Panel
                title="Alerts & Actions"
                badge={toNum(alerts.totalAlerts) + bankApprovals + codRemittances}
                icon={{ node: <IconAlertTriangle size={18} />, color: ui.danger }}
                minH="258px"
              >
                <Stack spacing={3}>
                  {bankApprovals > 0 ? (
                    <ActionRow
                      icon={<IconBuildingBank size={18} />}
                      label="Bank approvals pending"
                      count={bankApprovals}
                      route="/admin/users-management"
                    />
                  ) : null}
                  {codRemittances > 0 ? (
                    <ActionRow
                      icon={<IconWallet size={18} />}
                      label="COD remittances pending"
                      count={codRemittances}
                      route="/admin/cod-remittance"
                      tone="green"
                    />
                  ) : null}
                  {bankApprovals === 0 && codRemittances === 0 ? <EmptyState label="No alerts or pending actions" h="126px" /> : null}
                </Stack>
              </Panel>
            </Grid>

            <Grid templateColumns={{ base: '1fr', xl: '2fr 1fr' }} gap={5}>
              <Panel title="Trends (30d)" minH="330px">
                {(charts.ordersByDate || []).length ? (
                  <Box h="280px">
                    <OrdersLineChart data={charts.ordersByDate || []} />
                  </Box>
                ) : (
                  <EmptyState h="280px" />
                )}
              </Panel>
              <Panel title="Courier Performance (30d)" minH="330px">
                {topCouriers.length ? (
                  <Stack spacing={3}>
                    {topCouriers.slice(0, 5).map((courier) => (
                      <Flex key={courier.name} justify="space-between" p={3} borderRadius="8px" bg={ui.surfaceMuted}>
                        <Box>
                          <Text color={ui.text} fontWeight="700">{courier.name}</Text>
                          <Text color={ui.muted} fontSize="xs">{courier.count} orders</Text>
                        </Box>
                        <Text color={ui.success} fontWeight="800">{courier.deliveryRate}%</Text>
                      </Flex>
                    ))}
                  </Stack>
                ) : (
                  <EmptyState h="280px" />
                )}
              </Panel>
            </Grid>

            <Panel title="Revenue & Margins" minH="430px">
              <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} mb={6}>
                <Box p={4} borderRadius="10px" bg={ui.primaryBg}>
                  <Text color={ui.muted} fontSize="sm">Total Revenue</Text>
                  <Text color={ui.text} fontSize="2xl" fontWeight="800" mt={1}>{formatCurrency(totalRevenue)}</Text>
                </Box>
                <Box p={4} borderRadius="10px" bg={ui.accentBg}>
                  <Text color={ui.muted} fontSize="sm">Total Cost</Text>
                  <Text color={ui.text} fontSize="2xl" fontWeight="800" mt={1}>{formatCurrency(totalCost)}</Text>
                </Box>
                <Box p={4} borderRadius="10px" bg={totalMargin >= 0 ? ui.successBg : ui.dangerBg}>
                  <Text color={ui.muted} fontSize="sm">Total Margin</Text>
                  <Text color={totalMargin >= 0 ? ui.success : ui.danger} fontSize="2xl" fontWeight="800" mt={1}>
                    {formatCurrency(totalMargin)}
                  </Text>
                </Box>
              </SimpleGrid>
              <RevenueTable rows={courierRows} />
            </Panel>

            <Grid templateColumns={{ base: '1fr', xl: '1fr 1fr' }} gap={5}>
              <Panel title="Order Distribution by Courier" minH="310px">
                {topCouriers.length ? (
                  <Box h="250px">
                    <CourierDistributionChart data={couriers.performance || {}} />
                  </Box>
                ) : (
                  <EmptyState h="250px" />
                )}
              </Panel>
              <Panel title="Payment Type Split (30d)" minH="310px">
                {(charts.revenueByDate || []).length ? (
                  <Box h="164px" mb={4}>
                    <RevenueBarChart data={charts.revenueByDate || []} />
                  </Box>
                ) : (
                  <EmptyState h="164px" />
                )}
                <SimpleGrid columns={2} spacing={4}>
                  <Box p={4} borderRadius="10px" bg={ui.primaryBg} textAlign="center">
                    <Text color={ui.muted} fontSize="sm">Prepaid Revenue</Text>
                    <Text color={ui.text} fontWeight="800" fontSize="lg" mt={1}>{formatCurrency(prepaid.revenue)}</Text>
                    <Text color={ui.muted} fontSize="xs">{toNum(prepaid.orders)} orders</Text>
                  </Box>
                  <Box p={4} borderRadius="10px" bg={ui.accentBg} textAlign="center">
                    <Text color={ui.muted} fontSize="sm">COD Revenue</Text>
                    <Text color={ui.text} fontWeight="800" fontSize="lg" mt={1}>{formatCurrency(cod.revenue)}</Text>
                    <Text color={ui.muted} fontSize="xs">{toNum(cod.orders)} orders</Text>
                  </Box>
                </SimpleGrid>
              </Panel>
            </Grid>

            <Grid templateColumns={{ base: '1fr', xl: '1fr 1fr' }} gap={5}>
              <Panel title="Top Sellers" icon={{ node: <IconChartBar size={18} />, color: ui.primary }} minH="235px">
                {(sellers.topSellers || []).length ? (
                  <Stack spacing={3}>
                    {(sellers.topSellers || []).slice(0, 5).map((seller) => (
                      <Flex key={seller.name || seller.sellerName} justify="space-between" color={ui.text}>
                        <Text>{seller.name || seller.sellerName}</Text>
                        <Text fontWeight="800">{toNum(seller.orders)}</Text>
                      </Flex>
                    ))}
                  </Stack>
                ) : (
                  <EmptyState label="No seller data" h="120px" />
                )}
              </Panel>
              <Panel title="High RTO Sellers" icon={{ node: <IconAlertTriangle size={18} />, color: ui.danger }} minH="235px">
                {(sellers.highRtoSellers || []).length ? (
                  <Stack spacing={3}>
                    {(sellers.highRtoSellers || []).slice(0, 5).map((seller) => (
                      <Flex key={seller.name || seller.sellerName} justify="space-between" color={ui.text}>
                        <Text>{seller.name || seller.sellerName}</Text>
                        <Text color={ui.danger} fontWeight="800">{toNum(seller.rtoRate)}%</Text>
                      </Flex>
                    ))}
                  </Stack>
                ) : (
                  <EmptyState label="No high RTO sellers" h="120px" />
                )}
              </Panel>
            </Grid>

            <Panel title="Top States (30d)" minH="235px">
              {topStates.length ? (
                <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={3}>
                  {topStates.slice(0, 8).map((state) => (
                    <Flex key={state.state || state.name} p={3} borderRadius="8px" bg={ui.surfaceMuted} justify="space-between">
                      <Text color={ui.text}>{state.state || state.name}</Text>
                      <Badge>{toNum(state.count)}</Badge>
                    </Flex>
                  ))}
                </SimpleGrid>
              ) : (
                <EmptyState h="120px" />
              )}
            </Panel>
          </Stack>
        )}
      </Container>
    </Box>
  )
}
