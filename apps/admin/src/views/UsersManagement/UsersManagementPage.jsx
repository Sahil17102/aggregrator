import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  Stack,
  Switch,
  Text,
  useToast,
} from "@chakra-ui/react";
import {
  IconClock,
  IconEye,
  IconMail,
  IconPhone,
  IconShieldCheck,
  IconShieldX,
  IconUsers,
  IconUserX,
  IconWaveSine,
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
import { useUpdateUserApproval, useUsersWithRoleUser } from "hooks/useUsers";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "SA";

const toDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const lastLogin = (value) => {
  if (!value) return "—";
  const diff = Date.now() - new Date(value).getTime();
  const hours = Math.max(1, Math.round(diff / 36e5));
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

export default function UsersManagementPage() {
  const history = useHistory();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState("");
  const updateUserApprovalMutation = useUpdateUserApproval();

  const { data: usersResponse, isLoading } = useUsersWithRoleUser({
    page,
    perPage,
    sortBy: "createdAt",
    sortOrder: "desc",
    search,
    approved:
      status === "active" ? true : status === "inactive" ? false : undefined,
    plan: plan || undefined,
  });

  const users = usersResponse?.data ?? [];
  const totalCount = usersResponse?.totalCount ?? users.length;

  const summary = useMemo(() => {
    const onboarded = users.filter(
      (user) => user.onboardingComplete || user.onboarding_complete
    ).length;
    const verified = users.filter(
      (user) =>
        user.kycVerified || user.kyc_verified || user.kycStatus === "verified"
    ).length;
    const inactive = users.filter(
      (user) => user.approved === false || user.isActive === false
    ).length;
    return {
      total: totalCount,
      verified,
      pending: users.filter((user) => user.kycStatus === "pending").length,
      onboarded,
      active: Math.max(0, totalCount - inactive),
      inactive,
    };
  }, [totalCount, users]);

  const handleView = (id) => {
    history.push(`/admin/users-management/${id}/overview`);
  };

  const handleApprovalChange = async (id, approved) => {
    try {
      await updateUserApprovalMutation.mutateAsync({ userId: id, approved });
      toast({
        status: "success",
        title: approved ? "Seller activated" : "Seller deactivated",
      });
    } catch (error) {
      toast({
        status: "error",
        title: "Action failed",
        description: error.response?.data?.message || "Please try again.",
      });
    }
  };

  return (
    <AdminStack>
      <PageIntro
        icon={IconUsers}
        title="Users"
        subtitle="Manage all registered users"
        right={
          <HStack spacing="26px" wrap="wrap">
            <Metric icon={IconUsers} value={summary.total} label="total" />
            <Metric
              icon={IconShieldCheck}
              value={summary.verified}
              label="KYC verified"
              color="#00A881"
            />
            <Metric
              icon={IconShieldX}
              value={summary.pending}
              label="KYC pending"
              color="#FF7A1A"
            />
            <Metric
              icon={IconWaveSine}
              value={summary.onboarded}
              label="onboarded"
              color="#2F80ED"
            />
            <Metric
              icon={IconWaveSine}
              value={summary.active}
              label="active"
              color="#FF7A1A"
            />
            <Metric
              icon={IconUserX}
              value={summary.inactive}
              label="inactive"
              color="#FF4D4F"
            />
          </HStack>
        }
      />

      <ToolbarCard>
        <Flex align="end" gap="14px" wrap="wrap">
          <Box>
            <Text fontSize="14px" color="#41557A" mb="7px">
              Search
            </Text>
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Name, email, phone..."
              maxW="300px"
            />
          </Box>
          <Box>
            <Text fontSize="14px" color="#41557A" mb="7px">
              Status
            </Text>
            <AdminSelect
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
              placeholder="All statuses"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </AdminSelect>
          </Box>
          <Box>
            <Text fontSize="14px" color="#41557A" mb="7px">
              Plan
            </Text>
            <AdminSelect
              value={plan}
              onChange={(value) => {
                setPlan(value);
                setPage(1);
              }}
              placeholder="All Plans"
            >
              <option value="">All Plans</option>
              <option value="basic">Basic</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
            </AdminSelect>
          </Box>
          <Button variant="ghost" color="#6C5CE7" mt={{ base: 0, md: "27px" }}>
            More filters
          </Button>
          <Text ml="auto" color="#607397" fontSize="15px" alignSelf="center">
            {totalCount} results
          </Text>
        </Flex>
      </ToolbarCard>

      <HStack
        spacing="38px"
        borderBottom="1px solid #E5EAF3"
        px="20px"
        overflowX="auto"
      >
        {[
          ["All Users", summary.total, true],
          ["Verified", summary.verified],
          ["Pending KYC", summary.pending],
          [
            "KYC Not Started",
            Math.max(0, summary.total - summary.verified - summary.pending),
          ],
          ["Not Onboarded", Math.max(0, summary.total - summary.onboarded)],
          ["Inactive", summary.inactive],
        ].map(([label, count, active]) => (
          <HStack
            key={label}
            pb="15px"
            borderBottom={
              active ? "2px solid #6C5CE7" : "2px solid transparent"
            }
            color={active ? "#6C5CE7" : "#586B8A"}
            flexShrink={0}
          >
            <Text fontSize="18px">{label}</Text>
            <SoftBadge colorScheme={active ? "purple" : "gray"}>
              {count}
            </SoftBadge>
          </HStack>
        ))}
      </HStack>

      <DataTable
        loading={isLoading}
        rows={users}
        columns={[
          {
            key: "contactPerson",
            label: "User",
            render: (value, row) => {
              const name =
                value ||
                row.name ||
                row.companyInfo?.contactPerson ||
                row.email ||
                "User";
              const business =
                row.companyInfo?.brandName ||
                row.companyInfo?.businessName ||
                row.businessName;
              return (
                <HStack spacing="12px">
                  <Avatar
                    name={getInitials(name)}
                    size="sm"
                    bg="#F0EDFF"
                    color="#6C5CE7"
                  />
                  <Box>
                    <Text fontWeight="600">{name}</Text>
                    {business ? (
                      <Text fontSize="15px" color="#607397">
                        {business}
                      </Text>
                    ) : null}
                  </Box>
                </HStack>
              );
            },
          },
          {
            key: "email",
            label: "Email",
            render: (value) => (
              <HStack color="#23324D">
                <Icon as={IconMail} boxSize="17px" color="#607397" />
                <Text noOfLines={1}>{value || "—"}</Text>
              </HStack>
            ),
          },
          {
            key: "contactNumber",
            label: "Phone",
            render: (value) =>
              value ? (
                <HStack>
                  <Icon as={IconPhone} boxSize="17px" color="#607397" />
                  <Text>{value}</Text>
                </HStack>
              ) : (
                "—"
              ),
          },
          {
            key: "approved",
            label: "Status",
            render: (value, row) => (
              <Stack spacing="5px" align="flex-start">
                <SoftBadge
                  colorScheme={
                    row.onboardingComplete || row.onboarding_complete
                      ? "green"
                      : "orange"
                  }
                >
                  {row.onboardingComplete || row.onboarding_complete
                    ? "Onboarded"
                    : "Not Onboarded"}
                </SoftBadge>
                <SoftBadge
                  colorScheme={
                    row.kycVerified ||
                    row.kyc_verified ||
                    row.kycStatus === "verified"
                      ? "green"
                      : "gray"
                  }
                >
                  {row.kycVerified ||
                  row.kyc_verified ||
                  row.kycStatus === "verified"
                    ? "KYC Verified"
                    : "KYC Not Started"}
                </SoftBadge>
              </Stack>
            ),
          },
          {
            key: "plan",
            label: "Plan",
            render: (value, row) => (
              <SoftBadge colorScheme="gray">
                {value?.name || row.planName || "Basic"}
              </SoftBadge>
            ),
          },
          {
            key: "lastLogin",
            label: "Last Login",
            render: (value, row) => (
              <HStack>
                <Icon as={IconClock} boxSize="16px" color="#607397" />
                <Text>
                  {lastLogin(value || row.last_login_at || row.updatedAt)}
                </Text>
              </HStack>
            ),
          },
          {
            key: "createdAt",
            label: "Joined",
            render: (value) => toDate(value),
          },
        ]}
        actions={(row) => (
          <HStack justify="flex-end" spacing="12px">
            <IconButton
              aria-label="View seller"
              icon={<IconEye size={18} />}
              size="sm"
              variant="ghost"
              color="#607397"
              onClick={() => handleView(row.id)}
            />
            <Switch
              colorScheme="purple"
              isChecked={row.approved !== false}
              isDisabled={updateUserApprovalMutation.isPending}
              onChange={(event) => handleApprovalChange(row.id, event.target.checked)}
            />
          </HStack>
        )}
        footer={
          <>
            <Text color="#607397" fontSize="16px">
              Page {page}
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
              isDisabled={users.length < perPage}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </Button>
            <AdminSelect
              value={perPage}
              onChange={(value) => setPerPage(Number(value))}
              maxW="135px"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </AdminSelect>
          </>
        }
        minW="1320px"
      />
    </AdminStack>
  );
}
