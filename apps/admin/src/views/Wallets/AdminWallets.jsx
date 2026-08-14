import {
  Avatar,
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tooltip,
  Tr,
  VStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import {
  IconArrowDownCircle,
  IconArrowUpCircle,
  IconHistory,
  IconWallet,
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
  useAdjustWalletBalance,
  useAdminWallets,
  useAdminWalletTransactions,
} from "hooks/useWallet";
import ReasonSelect from "components/ReasonSelect";
import { walletAdjustmentReasons } from "utils/constants";
import { useMemo, useState } from "react";

const formatBalance = (balance, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    minimumFractionDigits: 2,
  }).format(Number(balance || 0));

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getCompanyName = (companyInfo, row = {}) =>
  companyInfo?.brandName ||
  companyInfo?.businessName ||
  companyInfo?.companyName ||
  companyInfo?.displayName ||
  companyInfo?.name ||
  row.userName ||
  row.userEmail ||
  "Seller";

const getContactPerson = (row = {}) =>
  row.companyInfo?.contactPerson || row.contactPerson || "—";

const getPhone = (row = {}) =>
  row.companyInfo?.contactNumber ||
  row.companyInfo?.companyContactNumber ||
  row.userPhone ||
  row.phone ||
  "—";

const emptyAdjustment = (type) => ({
  type,
  amount: "",
  reason: walletAdjustmentReasons[type][0],
  notes: "",
});

export default function AdminWallets() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionType, setTransactionType] = useState("");
  const [transactionReason, setTransactionReason] = useState("");
  const [adjustForm, setAdjustForm] = useState(emptyAdjustment("credit"));
  const transactionsModal = useDisclosure();
  const adjustmentModal = useDisclosure();

  const { data: walletsData, isLoading } = useAdminWallets({
    page,
    limit,
    search,
    sortBy: "updatedAt",
    sortOrder: "desc",
  });

  const {
    data: transactionsData,
    isLoading: transactionsLoading,
  } = useAdminWalletTransactions(
    selectedWallet?.userId,
    {
      page: transactionsPage,
      limit: 20,
      type: transactionType || undefined,
      reason: transactionReason || undefined,
    },
    transactionsModal.isOpen && Boolean(selectedWallet?.userId)
  );

  const adjustMutation = useAdjustWalletBalance();
  const wallets = useMemo(() => walletsData?.data || [], [walletsData?.data]);
  const totalCount = walletsData?.totalCount || wallets.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

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

  const openTransactions = (wallet) => {
    setSelectedWallet(wallet);
    setTransactionsPage(1);
    setTransactionType("");
    setTransactionReason("");
    transactionsModal.onOpen();
  };

  const openAdjustment = (wallet, type) => {
    setSelectedWallet(wallet);
    setAdjustForm(emptyAdjustment(type));
    adjustmentModal.onOpen();
  };

  const submitAdjustment = async () => {
    const amount = Number(adjustForm.amount);
    if (!Number.isFinite(amount) || amount <= 0 || !adjustForm.reason.trim()) {
      toast({
        status: "error",
        title: "Amount and reason are required",
        description: "Enter a positive wallet amount and a reason.",
      });
      return;
    }

    try {
      await adjustMutation.mutateAsync({
        userId: selectedWallet.userId,
        type: adjustForm.type,
        amount,
        reason: adjustForm.reason.trim(),
        notes: adjustForm.notes.trim(),
      });
      toast({
        status: "success",
        title:
          adjustForm.type === "credit"
            ? "Wallet recharged / credited"
            : "Wallet debited",
      });
      adjustmentModal.onClose();
    } catch (error) {
      toast({
        status: "error",
        title: "Wallet update failed",
        description:
          error.response?.data?.message ||
          "Please try the wallet update again.",
      });
    }
  };

  const transactions = transactionsData?.transactions || [];
  const transactionTotal = transactionsData?.totalCount || 0;
  const transactionPages = Math.max(1, Math.ceil(transactionTotal / 20));

  return (
    <AdminStack>
      <PageIntro
        icon={IconWallet}
        title="Wallet Management"
        subtitle="View transactions, recharge, credit or debit every seller wallet"
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
            placeholder="Search seller name, email or phone..."
            maxW="380px"
          />
        </Box>
      </ToolbarCard>

      <DataTable
        loading={isLoading}
        rows={wallets}
        columns={[
          {
            key: "seller",
            label: "Seller",
            render: (_value, row) => {
              const companyName = getCompanyName(row.companyInfo, row);
              return (
                <HStack spacing="13px">
                  <Avatar
                    name={companyName}
                    src={row.profilePicture || row.companyInfo?.profilePicture}
                    size="sm"
                    bg="#F0EDFF"
                    color="#6C5CE7"
                  />
                  <Box>
                    <Text fontWeight="700">{companyName}</Text>
                    <Text color="#607397" fontSize="14px">
                      {getContactPerson(row)}
                    </Text>
                  </Box>
                </HStack>
              );
            },
          },
          {
            key: "userEmail",
            label: "Email",
            render: (value, row) => value || row.email || "—",
          },
          {
            key: "phone",
            label: "Phone",
            render: (_value, row) => getPhone(row),
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
            render: (value, row) => (
              <Text
                fontWeight="800"
                color={Number(value || 0) > 0 ? "#009E72" : "#607397"}
              >
                {formatBalance(value, row.currency)}
              </Text>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: () => <SoftBadge colorScheme="green">Active</SoftBadge>,
          },
        ]}
        actions={(row) => (
          <HStack justify="flex-end" spacing="8px">
            <Tooltip label="View wallet transactions" hasArrow>
              <Button
                leftIcon={<IconHistory size={17} />}
                variant="outline"
                size="sm"
                colorScheme="blue"
                onClick={() => openTransactions(row)}
              >
                Transactions
              </Button>
            </Tooltip>
            <Tooltip label="Recharge or credit wallet" hasArrow>
              <Button
                leftIcon={<IconArrowUpCircle size={17} />}
                variant="outline"
                size="sm"
                colorScheme="green"
                onClick={() => openAdjustment(row, "credit")}
              >
                Recharge / Credit
              </Button>
            </Tooltip>
            <Tooltip label="Debit wallet" hasArrow>
              <Button
                leftIcon={<IconArrowDownCircle size={17} />}
                variant="outline"
                size="sm"
                colorScheme="red"
                onClick={() => openAdjustment(row, "debit")}
              >
                Debit
              </Button>
            </Tooltip>
          </HStack>
        )}
        footer={
          <>
            <Text color="#607397">
              Page {page} of {totalPages}
            </Text>
            <Button
              size="sm"
              variant="outline"
              isDisabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              isDisabled={page >= totalPages}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </Button>
            <AdminSelect
              value={limit}
              onChange={(value) => {
                setLimit(Number(value));
                setPage(1);
              }}
              maxW="135px"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </AdminSelect>
          </>
        }
        minW="1460px"
      />

      <Modal
        isOpen={transactionsModal.isOpen}
        onClose={transactionsModal.onClose}
        size="6xl"
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text>Wallet Transactions</Text>
            {selectedWallet ? (
              <Text fontSize="sm" color="#607397" fontWeight="500" mt="3px">
                {getCompanyName(selectedWallet.companyInfo, selectedWallet)} ·
                Balance{" "}
                {formatBalance(selectedWallet.balance, selectedWallet.currency)}
              </Text>
            ) : null}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <HStack align="flex-end" spacing="14px" mb="18px" wrap="wrap">
              <FormControl maxW="240px">
                <FormLabel>Transaction type</FormLabel>
                <Select
                  value={transactionType}
                  onChange={(event) => {
                    setTransactionType(event.target.value);
                    setTransactionsPage(1);
                  }}
                >
                  <option value="">All transactions</option>
                  <option value="credit">Credit / Recharge</option>
                  <option value="debit">Debit</option>
                </Select>
              </FormControl>
              <FormControl maxW="330px">
                <FormLabel>Reason contains</FormLabel>
                <Input
                  value={transactionReason}
                  onChange={(event) => {
                    setTransactionReason(event.target.value);
                    setTransactionsPage(1);
                  }}
                  placeholder="Search any transaction reason"
                />
              </FormControl>
            </HStack>

            {transactionsLoading ? (
              <HStack justify="center" py="48px">
                <Spinner color="#6C5CE7" />
                <Text color="#607397">Loading transactions...</Text>
              </HStack>
            ) : (
              <TableContainer border="1px solid #E5EAF3" borderRadius="12px">
                <Table size="sm">
                  <Thead bg="#F4F1FF">
                    <Tr>
                      <Th>Date</Th>
                      <Th>Type</Th>
                      <Th isNumeric>Amount</Th>
                      <Th>Reason</Th>
                      <Th>Reference</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {transactions.length ? (
                      transactions.map((transaction) => (
                        <Tr key={transaction.id}>
                          <Td whiteSpace="nowrap">
                            {formatDate(transaction.created_at)}
                          </Td>
                          <Td>
                            <SoftBadge
                              colorScheme={
                                transaction.type === "credit" ? "green" : "red"
                              }
                            >
                              {transaction.type === "credit"
                                ? "Credit"
                                : "Debit"}
                            </SoftBadge>
                          </Td>
                          <Td
                            isNumeric
                            fontWeight="800"
                            color={
                              transaction.type === "credit"
                                ? "green.600"
                                : "red.600"
                            }
                          >
                            {transaction.type === "credit" ? "+" : "-"}
                            {formatBalance(
                              transaction.amount,
                              transaction.currency
                            )}
                          </Td>
                          <Td>{transaction.reason || "—"}</Td>
                          <Td fontFamily="mono" fontSize="xs">
                            {transaction.ref || "—"}
                          </Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td
                          colSpan={5}
                          textAlign="center"
                          py="40px"
                          color="#607397"
                        >
                          No wallet transactions found
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack w="100%" justify="space-between">
              <Text color="#607397" fontSize="sm">
                Page {transactionsPage} of {transactionPages} ·{" "}
                {transactionTotal} records
              </Text>
              <HStack>
                <Button
                  size="sm"
                  variant="outline"
                  isDisabled={transactionsPage <= 1}
                  onClick={() =>
                    setTransactionsPage((value) => Math.max(1, value - 1))
                  }
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  isDisabled={transactionsPage >= transactionPages}
                  onClick={() => setTransactionsPage((value) => value + 1)}
                >
                  Next
                </Button>
                <Button onClick={transactionsModal.onClose}>Close</Button>
              </HStack>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={adjustmentModal.isOpen}
        onClose={adjustmentModal.onClose}
        size="lg"
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {adjustForm.type === "credit"
              ? "Recharge / Credit Wallet"
              : "Debit Wallet"}
            {selectedWallet ? (
              <Text fontSize="sm" color="#607397" fontWeight="500" mt="3px">
                {getCompanyName(selectedWallet.companyInfo, selectedWallet)} ·
                Current balance{" "}
                {formatBalance(selectedWallet.balance, selectedWallet.currency)}
              </Text>
            ) : null}
          </ModalHeader>
          <ModalCloseButton isDisabled={adjustMutation.isPending} />
          <ModalBody>
            <VStack spacing="16px" align="stretch">
              <FormControl isRequired>
                <FormLabel>Transaction type</FormLabel>
                <Select
                  value={adjustForm.type}
                  onChange={(event) =>
                    setAdjustForm(emptyAdjustment(event.target.value))
                  }
                  isDisabled={adjustMutation.isPending}
                >
                  <option value="credit">Recharge / Credit (add money)</option>
                  <option value="debit">Debit (deduct money)</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Amount (INR)</FormLabel>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={adjustForm.amount}
                  onChange={(event) =>
                    setAdjustForm((current) => ({
                      ...current,
                      amount: event.target.value,
                    }))
                  }
                  placeholder="Enter amount"
                  isDisabled={adjustMutation.isPending}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Reason</FormLabel>
                <ReasonSelect
                  options={walletAdjustmentReasons[adjustForm.type]}
                  value={adjustForm.reason}
                  onChange={(reason) =>
                    setAdjustForm((current) => ({
                      ...current,
                      reason,
                    }))
                  }
                  placeholder="Select wallet adjustment reason"
                  customPlaceholder="Enter the custom wallet reason"
                  isDisabled={adjustMutation.isPending}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={adjustForm.notes}
                  onChange={(event) =>
                    setAdjustForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  placeholder="Optional internal notes"
                  isDisabled={adjustMutation.isPending}
                />
              </FormControl>
              {adjustForm.type === "debit" &&
              Number(adjustForm.amount || 0) >
                Number(selectedWallet?.balance || 0) ? (
                <Box
                  bg="orange.50"
                  color="orange.800"
                  borderRadius="10px"
                  p="12px"
                >
                  This debit is higher than the current wallet balance and will
                  make it negative.
                </Box>
              ) : null}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr="10px"
              onClick={adjustmentModal.onClose}
              isDisabled={adjustMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              colorScheme={adjustForm.type === "credit" ? "green" : "red"}
              leftIcon={
                adjustForm.type === "credit" ? (
                  <IconArrowUpCircle size={18} />
                ) : (
                  <IconArrowDownCircle size={18} />
                )
              }
              onClick={submitAdjustment}
              isLoading={adjustMutation.isPending}
            >
              {adjustForm.type === "credit"
                ? "Recharge / Credit"
                : "Debit Wallet"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AdminStack>
  );
}
