import { Avatar, Box, HStack, IconButton, Stack, Text } from "@chakra-ui/react";
import {
  IconArrowDownCircle,
  IconArrowUpCircle,
  IconHistory,
  IconWallet,
} from "@tabler/icons-react";
import {
  AdminStack,
  DataTable,
  Metric,
  PageIntro,
  SearchInput,
  SoftBadge,
  ToolbarCard,
} from "components/AdminUI/AdminPage";
import { useAdminWallets } from "hooks/useWallet";
import { useMemo, useState } from "react";

const formatBalance = (balance) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(balance || 0));

const getCompanyName = (companyInfo, row) =>
  companyInfo?.brandName ||
  companyInfo?.businessName ||
  companyInfo?.name ||
  row?.userName ||
  "—";

export default function AdminWallets() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const { data: walletsData, isLoading } = useAdminWallets({
    page,
    limit,
    search,
    sortBy: "updatedAt",
    sortOrder: "desc",
  });

  const wallets = walletsData?.data || [];
  const totalCount = walletsData?.totalCount || wallets.length;

  const summary = useMemo(() => {
    const totalBalance = wallets.reduce(
      (sum, wallet) => sum + Number(wallet.balance || 0),
      0
    );
    const withBalance = wallets.filter(
      (wallet) => Number(wallet.balance || 0) > 0
    ).length;
    return { totalBalance, withBalance };
  }, [wallets]);

  return (
    <AdminStack>
      <PageIntro
        icon={IconWallet}
        title="Wallet Management"
        subtitle="View and manage merchant wallets"
        right={
          <HStack spacing="28px" wrap="wrap">
            <Metric
              icon={IconWallet}
              value={totalCount}
              label="total wallets"
              color="#2F80ED"
            />
            <Metric
              icon={IconWallet}
              value={summary.totalBalance.toLocaleString("en-IN")}
              label="total balance (₹)"
              color="#00A881"
            />
            <Metric
              icon={IconArrowUpCircle}
              value={summary.withBalance}
              label="with balance"
              color="#FF9C1A"
            />
          </HStack>
        }
      />

      <ToolbarCard>
        <Box>
          <Text color="#41557A" fontSize="14px" mb="7px">
            Search
          </Text>
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search by name, email, phone..."
            maxW="350px"
          />
        </Box>
      </ToolbarCard>

      <DataTable
        loading={isLoading}
        rows={wallets}
        columns={[
          {
            key: "user",
            label: "User",
            render: (_value, row) => {
              const companyName = getCompanyName(row.companyInfo, row);
              return (
                <HStack spacing="13px">
                  <Avatar
                    name={companyName}
                    size="sm"
                    bg="#F0EDFF"
                    color="#6C5CE7"
                  />
                  <Box>
                    <Text fontWeight="700">{companyName}</Text>
                    <Text color="#607397" fontSize="15px">
                      {row.userEmail || row.email || "—"}
                    </Text>
                  </Box>
                </HStack>
              );
            },
          },
          {
            key: "business",
            label: "Business",
            render: (_value, row) =>
              row.companyInfo?.businessName ||
              row.companyInfo?.brandName ||
              "—",
          },
          {
            key: "plan",
            label: "Plan",
            render: (_value, row) => (
              <SoftBadge colorScheme="gray">
                {row.planName || "Basic"}
              </SoftBadge>
            ),
          },
          {
            key: "balance",
            label: "Balance",
            align: "right",
            render: (value) => (
              <Text
                fontWeight="800"
                color={Number(value || 0) > 0 ? "#009E72" : "#607397"}
              >
                {formatBalance(value)}
              </Text>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: () => <SoftBadge colorScheme="green">Active</SoftBadge>,
          },
        ]}
        actions={() => (
          <HStack justify="flex-end" spacing="12px">
            <IconButton
              aria-label="History"
              icon={<IconHistory size={18} />}
              variant="ghost"
              size="sm"
              color="#607397"
            />
            <IconButton
              aria-label="Credit"
              icon={<IconArrowUpCircle size={18} />}
              variant="ghost"
              size="sm"
              color="#607397"
            />
            <IconButton
              aria-label="Debit"
              icon={<IconArrowDownCircle size={18} />}
              variant="ghost"
              size="sm"
              color="#607397"
            />
          </HStack>
        )}
        footer={
          <Stack direction="row" spacing="12px" align="center">
            <Text color="#607397">
              {page} / {Math.max(1, Math.ceil(totalCount / limit))}
            </Text>
          </Stack>
        }
        minW="1080px"
      />
    </AdminStack>
  );
}
