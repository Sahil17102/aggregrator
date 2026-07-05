import { Box, Button, HStack, IconButton, Text } from "@chakra-ui/react";
import {
  IconBolt,
  IconClock,
  IconDownload,
  IconFile,
  IconReceipt,
  IconUpload,
  IconUsers,
} from "@tabler/icons-react";
import {
  AdminSelect,
  AdminStack,
  DataTable,
  Metric,
  PageIntro,
  SearchInput,
  SoftBadge,
  ToolbarCard,
} from "components/AdminUI/AdminPage";
import {
  useAllCodRemittances,
  useCodPlatformStats,
} from "hooks/useCodRemittance";
import { useState } from "react";
import { exportAllCodRemittances } from "services/codRemittance.service";
import { getCourierDisplayName } from "utils/courierDisplay";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export default function AdminCodRemittancePage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [filters, setFilters] = useState({ search: "", status: "" });
  const { data: stats } = useCodPlatformStats();
  const { data: remittanceData, isLoading } = useAllCodRemittances({
    page,
    limit: perPage,
    ...filters,
  });

  const remittances = remittanceData?.data?.remittances || [];
  const totalCount = remittanceData?.data?.totalCount || remittances.length;
  const statData = stats?.data || {};

  return (
    <AdminStack>
      <PageIntro
        icon={IconReceipt}
        title="COD Remittance"
        subtitle="Track and process COD settlements"
        right={
          <HStack spacing="28px" wrap="wrap">
            <Metric
              icon={IconClock}
              value={(statData.totalPending?.amount || 0).toLocaleString(
                "en-IN"
              )}
              label="pending (₹)"
              color="#FF7A1A"
            />
            <Metric
              icon={IconReceipt}
              value={(statData.todayCredited?.amount || 0).toLocaleString(
                "en-IN"
              )}
              label="today credited (₹)"
              color="#00A881"
            />
            <Metric
              icon={IconReceipt}
              value={(statData.totalCredited?.amount || 0).toLocaleString(
                "en-IN"
              )}
              label="total credited (₹)"
              color="#2F80ED"
            />
            <Metric
              icon={IconUsers}
              value={statData.usersWithPending || 0}
              label="users pending"
              color="#8B5CF6"
            />
          </HStack>
        }
      />

      <ToolbarCard>
        <HStack spacing="14px" align="end" wrap="wrap">
          <Box>
            <Text color="#41557A" fontSize="14px" mb="7px">
              Search
            </Text>
            <SearchInput
              value={filters.search}
              onChange={(value) => {
                setFilters((prev) => ({ ...prev, search: value }));
                setPage(1);
              }}
              placeholder="Order, AWB, or email..."
              maxW="325px"
            />
          </Box>
          <Box>
            <Text color="#41557A" fontSize="14px" mb="7px">
              Status
            </Text>
            <AdminSelect
              value={filters.status}
              onChange={(value) => {
                setFilters((prev) => ({ ...prev, status: value }));
                setPage(1);
              }}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="credited">Credited</option>
            </AdminSelect>
          </Box>
          <Button variant="ghost" color="#6C5CE7" mt="27px">
            More filters
          </Button>
          <HStack ml="auto" spacing="10px" mt="27px">
            <Button leftIcon={<IconUpload size={18} />} variant="outline">
              Upload CSV
            </Button>
            <Button leftIcon={<IconBolt size={18} />} variant="outline">
              Auto-Credit
            </Button>
            <Button
              leftIcon={<IconDownload size={18} />}
              variant="outline"
              onClick={() => exportAllCodRemittances(filters)}
            >
              Export
            </Button>
          </HStack>
        </HStack>
      </ToolbarCard>

      <DataTable
        loading={isLoading}
        rows={remittances}
        columns={[
          {
            key: "orderNumber",
            label: "Order",
            render: (value, row) => (
              <Box>
                <Text fontWeight="700">{value}</Text>
                <Text color="#607397" fontSize="15px" noOfLines={1}>
                  AWB: {row.awbNumber || "—"}
                </Text>
              </Box>
            ),
          },
          {
            key: "userEmail",
            label: "User",
            render: (value, row) => (
              <Box>
                <Text noOfLines={1}>{value}</Text>
                <Text color="#607397" fontSize="15px">
                  {row.userName || "—"}
                </Text>
              </Box>
            ),
          },
          {
            key: "courierPartner",
            label: "Courier",
            render: (value) => (
              <SoftBadge colorScheme="gray">
                {getCourierDisplayName(value, "Manual")}
              </SoftBadge>
            ),
          },
          {
            key: "codAmount",
            label: "COD Amount",
            align: "right",
            render: (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`,
          },
          {
            key: "remittableAmount",
            label: "Remittable",
            align: "right",
            render: (value) => (
              <Text color="#009E72" fontWeight="800">
                ₹{Number(value || 0).toLocaleString("en-IN")}
              </Text>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (value) => (
              <SoftBadge colorScheme={value === "pending" ? "orange" : "green"}>
                {value === "pending" ? "Pending" : "Credited"}
              </SoftBadge>
            ),
          },
          { key: "collectedAt", label: "Collected", render: formatDate },
          { key: "creditedAt", label: "Credited", render: formatDate },
        ]}
        actions={() => (
          <IconButton
            aria-label="Document"
            icon={<IconFile size={18} />}
            variant="ghost"
            size="sm"
            color="#607397"
          />
        )}
        footer={
          <Text color="#607397">
            {Math.min(page * perPage, totalCount)} of {totalCount}
          </Text>
        }
        minW="1260px"
      />
    </AdminStack>
  );
}
