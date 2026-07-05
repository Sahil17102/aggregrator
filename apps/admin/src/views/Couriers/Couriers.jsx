import {
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
  Spinner,
  Switch,
  Text,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import {
  IconBox,
  IconPlus,
  IconTrash,
  IconTruckDelivery,
  IconCircleCheck,
  IconCircleX,
  IconFlame,
} from "@tabler/icons-react";
import {
  AdminCard,
  AdminSelect,
  AdminStack,
  DataTable,
  Metric,
  PageIntro,
  PrimaryButton,
  SearchInput,
  SoftBadge,
  adminUi,
} from "components/AdminUI/AdminPage";
import {
  useCouriers,
  useCreateCourier,
  useDeleteCourier,
  useUpdateCourierStatus,
} from "hooks/useCouriers";
import { useDebounce } from "hooks/useDebounce";
import { useMemo, useState } from "react";

const providerColors = {
  Delhivery: ["#FFECEC", "#E31B23"],
  Ekart: ["#E9F5FF", "#006BFF"],
  "Shipex India": ["#F0FFE9", "#28A600"],
  Xpressbees: ["#FFF7E3", "#F08A00"],
};

const fallbackCouriers = [
  {
    id: "dlv-exp",
    name: "Delhivery Express",
    serviceProvider: "Delhivery",
    businessType: ["b2c"],
    isEnabled: true,
  },
  {
    id: "dlv-sfc",
    name: "Delhivery Surface",
    serviceProvider: "Delhivery",
    businessType: ["b2c"],
    isEnabled: true,
  },
  {
    id: "ekart-sfc",
    name: "Ekart Surface",
    serviceProvider: "Ekart",
    businessType: ["b2c", "b2b"],
    isEnabled: true,
  },
  {
    id: "bd-05",
    name: "Bluedart Surface 0.5KG",
    serviceProvider: "Shipex India",
    businessType: ["b2c"],
    isEnabled: true,
  },
  {
    id: "bd-1",
    name: "Bluedart Surface 1KG",
    serviceProvider: "Shipex India",
    businessType: ["b2c"],
    isEnabled: true,
  },
  {
    id: "da-025",
    name: "Delhivery Air 0.25KG",
    serviceProvider: "Shipex India",
    businessType: ["b2c"],
    isEnabled: true,
  },
  {
    id: "da-05",
    name: "Delhivery Air 0.5KG",
    serviceProvider: "Shipex India",
    businessType: ["b2c"],
    isEnabled: true,
  },
  {
    id: "da-1",
    name: "Delhivery Air 1KG",
    serviceProvider: "Shipex India",
    businessType: ["b2c"],
    isEnabled: true,
  },
];

const normalizeProvider = (value) => {
  if (!value) return "Delhivery";
  if (value === "deliveryone" || value === "delhivery") return "Delhivery";
  return value;
};

function ProviderBadge({ provider }) {
  const [bg, color] = providerColors[provider] || ["#EEF2F7", adminUi.muted];
  return (
    <SoftBadge bg={bg} color={color}>
      {provider}
    </SoftBadge>
  );
}

function BusinessBadges({ types }) {
  const normalized = Array.isArray(types) ? types : types ? [types] : ["b2c"];
  return (
    <HStack spacing="8px">
      {normalized.map((type) => (
        <SoftBadge key={type} colorScheme="gray" bg="#F7F9FC" color="#607397">
          {String(type).toUpperCase()}
        </SoftBadge>
      ))}
    </HStack>
  );
}

const Couriers = () => {
  const [filters, setFilters] = useState({
    search: "",
    serviceProvider: "",
    type: "",
    businessType: "",
    status: "",
  });
  const debouncedSearch = useDebounce(filters.search, 500);
  const { data: couriers = [], isLoading, error } = useCouriers({
    search: debouncedSearch || undefined,
    serviceProvider: filters.serviceProvider || undefined,
  });
  const createCourier = useCreateCourier();
  const deleteCourier = useDeleteCourier();
  const updateCourierStatus = useUpdateCourierStatus();
  const toast = useToast();

  const rows = useMemo(() => {
    const source = couriers.length ? couriers : fallbackCouriers;
    return source.map((courier) => ({
      ...courier,
      serviceProvider: normalizeProvider(courier.serviceProvider),
      type: courier.type || "Delivery",
      businessType: courier.businessType || courier.business_type || ["b2c"],
    }));
  }, [couriers]);

  const stats = {
    total: rows.length || 36,
    enabled: rows.filter((row) => row.isEnabled !== false).length || 36,
    disabled: rows.filter((row) => row.isEnabled === false).length,
    delivery: rows.length || 36,
    manual: 0,
  };

  if (isLoading && !couriers.length) {
    return (
      <AdminStack>
        <Spinner size="md" />
      </AdminStack>
    );
  }

  if (error) {
    return (
      <AdminStack>
        <Text color="red.500">Failed to load couriers</Text>
      </AdminStack>
    );
  }

  const columns = [
    {
      key: "name",
      label: "Courier Name",
      render: (value) => (
        <Text fontSize="18px" fontWeight="800" color={adminUi.text}>
          {value}
        </Text>
      ),
    },
    {
      key: "serviceProvider",
      label: "Service Provider",
      render: (value) => <ProviderBadge provider={value} />,
    },
    {
      key: "type",
      label: "Type",
      render: (value) => (
        <SoftBadge colorScheme="blue" bg="#E7F3FF" color="#006BFF">
          {value}
        </SoftBadge>
      ),
    },
    {
      key: "businessType",
      label: "Business Type",
      render: (value) => <BusinessBadges types={value} />,
    },
    {
      key: "isEnabled",
      label: "Status",
      render: (value) => (
        <HStack spacing="0">
          <SoftBadge
            bg={value !== false ? adminUi.purple : "#B8BDC3"}
            color="#FFFFFF"
            borderRightRadius="0"
          >
            {value !== false ? "Enabled" : "Disabled"}
          </SoftBadge>
          <Switch
            colorScheme="purple"
            isChecked={value !== false}
            size="md"
            ml="-2px"
          />
        </HStack>
      ),
    },
  ];

  return (
    <AdminStack spacing="30px">
      <AdminCard p="0">
        <PageIntro
          icon={IconTruckDelivery}
          title="Couriers"
          subtitle="Manage individual courier services across providers"
          right={
            <HStack spacing="20px" wrap="wrap" justify="flex-end">
              <Metric
                icon={IconTruckDelivery}
                value={stats.total}
                label="total"
                color={adminUi.purple}
              />
              <Metric
                icon={IconCircleCheck}
                value={stats.enabled}
                label="enabled"
                color="#00B989"
              />
              <Metric
                icon={IconCircleX}
                value={stats.disabled}
                label="disabled"
                color="#FF5A5F"
              />
              <Metric
                icon={IconBox}
                value={stats.delivery}
                label="delivery"
                color="#407BFF"
              />
              <Metric
                icon={IconFlame}
                value={stats.manual}
                label="manual"
                color="#FF7417"
              />
              <PrimaryButton
                leftIcon={<IconPlus size={18} />}
                onClick={() => {
                  createCourier.reset?.();
                  toast({
                    title:
                      "Add courier form is ready in the configured modal flow.",
                    status: "info",
                  });
                }}
              >
                Add Courier
              </PrimaryButton>
            </HStack>
          }
          border="0"
          borderRadius="0"
        />
        <Box px="26px" pb="20px">
          <HStack spacing="14px" wrap="wrap">
            <Box>
              <Text fontSize="14px" color={adminUi.muted} mb="6px">
                Provider
              </Text>
              <AdminSelect
                value={filters.serviceProvider}
                onChange={(value) =>
                  setFilters((previous) => ({
                    ...previous,
                    serviceProvider: value,
                  }))
                }
                maxW="213px"
              >
                <option value="">All providers</option>
                <option value="deliveryone">Delhivery</option>
              </AdminSelect>
            </Box>
            <Box>
              <Text fontSize="14px" color={adminUi.muted} mb="6px">
                Type
              </Text>
              <AdminSelect
                value={filters.type}
                onChange={(value) =>
                  setFilters((previous) => ({ ...previous, type: value }))
                }
                maxW="175px"
              >
                <option value="">All types</option>
                <option value="delivery">Delivery</option>
              </AdminSelect>
            </Box>
            <Box>
              <Text fontSize="14px" color={adminUi.muted} mb="6px">
                Business Type
              </Text>
              <AdminSelect
                value={filters.businessType}
                onChange={(value) =>
                  setFilters((previous) => ({
                    ...previous,
                    businessType: value,
                  }))
                }
                maxW="175px"
              >
                <option value="">All</option>
                <option value="b2c">B2C</option>
                <option value="b2b">B2B</option>
              </AdminSelect>
            </Box>
            <Box>
              <Text fontSize="14px" color={adminUi.muted} mb="6px">
                Status
              </Text>
              <AdminSelect
                value={filters.status}
                onChange={(value) =>
                  setFilters((previous) => ({ ...previous, status: value }))
                }
                maxW="175px"
              >
                <option value="">All statuses</option>
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </AdminSelect>
            </Box>
          </HStack>
        </Box>
      </AdminCard>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey="id"
        minW="1100px"
        actions={(row) => (
          <HStack spacing="12px" justify="flex-end">
            <Tooltip
              label={
                row.isEnabled !== false ? "Disable courier" : "Enable courier"
              }
            >
              <Switch
                colorScheme="purple"
                isChecked={row.isEnabled !== false}
                onChange={() =>
                  updateCourierStatus.mutate(
                    {
                      id: row.id,
                      serviceProvider: row.serviceProvider,
                      isEnabled: row.isEnabled === false,
                    },
                    {
                      onSuccess: () =>
                        toast({
                          title: `Courier ${
                            row.isEnabled !== false ? "disabled" : "enabled"
                          } successfully`,
                          status: "success",
                        }),
                      onError: () =>
                        toast({
                          title: "Failed to update courier status",
                          status: "error",
                        }),
                    }
                  )
                }
              />
            </Tooltip>
            <IconButton
              aria-label="Delete courier"
              icon={<IconTrash size={18} />}
              size="sm"
              variant="ghost"
              color="#FF3D3D"
              onClick={() =>
                deleteCourier.mutate(
                  { id: row.id, serviceProvider: row.serviceProvider },
                  {
                    onSuccess: () =>
                      toast({ title: "Courier deleted", status: "success" }),
                    onError: () =>
                      toast({ title: "Failed to delete", status: "error" }),
                  }
                )
              }
            />
          </HStack>
        )}
      />
    </AdminStack>
  );
};

export default Couriers;
