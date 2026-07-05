import { Box, Button, HStack, IconButton, Text } from "@chakra-ui/react";
import {
  IconDotsVertical,
  IconDownload,
  IconEye,
  IconFileInvoice,
  IconFileSpreadsheet,
  IconPlus,
} from "@tabler/icons-react";
import {
  AdminStack,
  DataTable,
  PageIntro,
  SearchInput,
  SoftBadge,
  ToolbarCard,
} from "components/AdminUI/AdminPage";
import { useAdminBillingInvoices } from "hooks/useBillingInvoices";
import { useState } from "react";

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function AdminBillingInvoices() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAdminBillingInvoices({ page, limit, search });

  const rows = data?.invoices || data?.data || [];
  const totalCount = data?.totalCount || rows.length;

  return (
    <AdminStack>
      <PageIntro
        icon={IconFileInvoice}
        title="Billing Invoices"
        subtitle="Periodic receipts of charges deducted from seller wallets"
        right={
          <Button
            leftIcon={<IconPlus size={18} />}
            h="50px"
            variant="outline"
            fontSize="18px"
          >
            Generate Invoice
          </Button>
        }
      />

      <ToolbarCard>
        <Box>
          <Text color="#41557A" fontSize="14px" mb="7px">
            Search
          </Text>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Invoice #, email, or business..."
            maxW="325px"
          />
        </Box>
      </ToolbarCard>

      <DataTable
        loading={isLoading}
        rows={rows}
        columns={[
          {
            key: "invoiceNo",
            label: "Invoice #",
            render: (value, row) => value || row.invoice_number || row.id,
          },
          {
            key: "user",
            label: "User",
            render: (_value, row) => (
              <Box>
                <Text noOfLines={1}>{row.userEmail || row.email || "—"}</Text>
                <Text color="#607397" fontSize="15px">
                  {row.businessName || row.companyName || row.userName || "—"}
                </Text>
              </Box>
            ),
          },
          {
            key: "period",
            label: "Period",
            render: (_value, row) => (
              <HStack>
                <SoftBadge colorScheme="gray">
                  {formatDate(
                    row.periodFrom || row.startDate || row.period?.from
                  )}
                </SoftBadge>
                <Text>→</Text>
                <SoftBadge colorScheme="gray">
                  {formatDate(row.periodTo || row.endDate || row.period?.to)}
                </SoftBadge>
              </HStack>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (value) => (
              <SoftBadge colorScheme="blue">
                {String(value || "Generated")}
              </SoftBadge>
            ),
          },
          {
            key: "orderCount",
            label: "Orders",
            align: "center",
            render: (value, row) => value || row.orders || 0,
          },
          {
            key: "totalAmount",
            label: "Total Amount",
            align: "right",
            render: (value, row) => (
              <Text fontWeight="800">
                ₹{Number(value || row.netPayable || row.amount || 0).toFixed(2)}
              </Text>
            ),
          },
        ]}
        actions={() => (
          <HStack justify="flex-end" spacing="8px">
            <IconButton
              aria-label="PDF"
              icon={<IconDownload size={18} />}
              size="sm"
              variant="ghost"
              color="#FF5A5F"
            />
            <IconButton
              aria-label="CSV"
              icon={<IconFileSpreadsheet size={18} />}
              size="sm"
              variant="ghost"
              color="#00B894"
            />
            <IconButton
              aria-label="View"
              icon={<IconEye size={18} />}
              size="sm"
              variant="ghost"
              color="#00B8A9"
            />
            <IconButton
              aria-label="More"
              icon={<IconDotsVertical size={18} />}
              size="sm"
              variant="ghost"
              color="#607397"
            />
          </HStack>
        )}
        footer={
          <>
            <Text color="#607397">
              {Math.min((page - 1) * limit + 1, totalCount)}–
              {Math.min(page * limit, totalCount)} of {totalCount}
            </Text>
          </>
        }
        minW="1120px"
      />
    </AdminStack>
  );
}
