import {
  Box,
  Button,
  Checkbox,
  Flex,
  HStack,
  Icon,
  IconButton,
  Select,
  Spinner,
  Switch,
  Text,
} from "@chakra-ui/react";
import {
  IconCircleCheck,
  IconCircleX,
  IconDownload,
  IconGlobe,
  IconMapPin,
  IconPlus,
  IconTrash,
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
  adminUi,
} from "components/AdminUI/AdminPage";
import { useDeleteLocation, useLocations } from "hooks/useLocations";
import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

const fallbackLocations = [
  {
    id: "534125",
    pincode: "534125",
    city: "ACHANTA",
    state: "ANDHRA PRADESH",
    tags: "-",
    active: true,
  },
  {
    id: "534372",
    pincode: "534372",
    city: "ACHANTA",
    state: "ANDHRA PRADESH",
    tags: "-",
    active: true,
  },
  {
    id: "518317",
    pincode: "518317",
    city: "Adoni",
    state: "ANDHRA PRADESH",
    tags: "-",
    active: true,
  },
  {
    id: "518318",
    pincode: "518318",
    city: "Adoni",
    state: "ANDHRA PRADESH",
    tags: "-",
    active: true,
  },
  {
    id: "518424",
    pincode: "518424",
    city: "Atmakur",
    state: "ANDHRA PRADESH",
    tags: "-",
    active: true,
  },
  {
    id: "518425",
    pincode: "518425",
    city: "Atmakur",
    state: "ANDHRA PRADESH",
    tags: "-",
    active: true,
  },
  {
    id: "518535",
    pincode: "518535",
    city: "Atmakur",
    state: "ANDHRA PRADESH",
    tags: "-",
    active: true,
  },
];

function PaginationStrip({ total = 28381 }) {
  return (
    <Flex
      justify="flex-end"
      align="center"
      gap="18px"
      px="22px"
      py="12px"
      borderBottom="1px solid"
      borderColor={adminUi.border}
      bg="#FFFFFF"
    >
      <Text color="#93A0BA" fontSize="22px">
        ‹
      </Text>
      {[1, 2, 3, 4, 5].map((page) => (
        <Flex
          key={page}
          w="40px"
          h="40px"
          align="center"
          justify="center"
          borderRadius="9px"
          bg={page === 1 ? "#E8E2FF" : "transparent"}
          color={page === 1 ? adminUi.purple : adminUi.muted}
          fontSize="16px"
          fontWeight="700"
        >
          {page}
        </Flex>
      ))}
      <Text color="#93A0BA" fontSize="22px">
        ...284
      </Text>
      <Text color="#93A0BA" fontSize="22px">
        ›
      </Text>
      <Select
        maxW="154px"
        h="40px"
        borderColor="#D6DEE9"
        fontSize="17px"
        defaultValue="100"
      >
        <option value="100">100 / page</option>
        <option value="50">50 / page</option>
      </Select>
    </Flex>
  );
}

function ManualServiceability() {
  return (
    <AdminStack spacing="20px">
      <AdminCard p="25px">
        <Text fontSize="15px" color={adminUi.muted} mb="8px">
          Select Manual Courier
        </Text>
        <AdminSelect maxW="480px">
          <option value="">Choose a manual courier...</option>
        </AdminSelect>
      </AdminCard>
      <AdminCard
        minH="186px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color={adminUi.muted} fontSize="18px">
          Select a manual courier above to configure serviceability.
        </Text>
      </AdminCard>
    </AdminStack>
  );
}

function ServiceabilityLocations() {
  const [filters, setFilters] = useState({ search: "", state: "" });
  const { data, isLoading } = useLocations({ page: 1, limit: 100, ...filters });
  const { mutate: deleteLocation } = useDeleteLocation();

  const rows = useMemo(() => {
    const source = data?.data || [];
    if (!source.length) return fallbackLocations;
    return source.map((location) => ({
      ...location,
      id: location.id || location.pincode,
      tags:
        Array.isArray(location.tags) && location.tags.length
          ? location.tags.join(", ")
          : "-",
      active: location.active !== false,
    }));
  }, [data]);

  const total = data?.total || 28381;

  const columns = [
    {
      key: "select",
      label: "",
      w: "54px",
      render: () => <Checkbox borderColor="#D6DEE9" />,
    },
    { key: "pincode", label: "Pincode" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "tags", label: "Tags" },
    {
      key: "active",
      label: "Status",
      render: (value) => (
        <Switch colorScheme="purple" isChecked={value !== false} />
      ),
    },
  ];

  return (
    <AdminStack spacing="20px">
      <AdminCard p="0">
        <PageIntro
          icon={IconMapPin}
          title="Serviceability Locations"
          subtitle="Manage serviceable pincodes and zones"
          right={
            <HStack spacing="22px" wrap="wrap">
              <Metric
                icon={IconGlobe}
                value={total.toLocaleString("en-IN")}
                label="total"
                color={adminUi.purple}
              />
              <Metric
                icon={IconCircleCheck}
                value={total.toLocaleString("en-IN")}
                label="active"
                color="#00B989"
              />
              <Metric
                icon={IconCircleX}
                value="0"
                label="inactive"
                color="#FF5A5F"
              />
            </HStack>
          }
          border="0"
          borderRadius="0"
        />
        <Flex
          px="26px"
          pb="20px"
          gap="14px"
          justify="space-between"
          align="flex-end"
          wrap="wrap"
        >
          <HStack spacing="14px" wrap="wrap">
            <Box>
              <Text fontSize="14px" color={adminUi.muted} mb="6px">
                Search
              </Text>
              <SearchInput
                value={filters.search}
                onChange={(value) =>
                  setFilters((previous) => ({ ...previous, search: value }))
                }
                placeholder="Pincode, city, state..."
                maxW="300px"
              />
            </Box>
            <Box>
              <Text fontSize="14px" color={adminUi.muted} mb="6px">
                State
              </Text>
              <AdminSelect
                value={filters.state}
                onChange={(value) =>
                  setFilters((previous) => ({ ...previous, state: value }))
                }
                maxW="213px"
              >
                <option value="">All states</option>
                <option value="ANDHRA PRADESH">ANDHRA PRADESH</option>
              </AdminSelect>
            </Box>
            <Text color={adminUi.purple} fontSize="16px" mt="26px">
              More filters
            </Text>
          </HStack>
          <HStack spacing="10px">
            <Text color={adminUi.muted} fontSize="16px" mr="4px">
              {total} results
            </Text>
            <Button
              leftIcon={<IconDownload size={18} />}
              variant="outline"
              h="50px"
              borderColor="#D6DEE9"
              borderRadius="9px"
              bg="#FFFFFF"
              fontSize="18px"
            >
              Import CSV
            </Button>
            <PrimaryButton leftIcon={<IconPlus size={18} />}>
              Add Location
            </PrimaryButton>
          </HStack>
        </Flex>
      </AdminCard>

      <AdminCard overflow="hidden">
        <PaginationStrip total={total} />
        <DataTable
          columns={columns}
          rows={rows}
          loading={isLoading && !rows.length}
          rowKey="id"
          minW="1100px"
          actions={(row) => (
            <IconButton
              aria-label="Delete location"
              icon={<IconTrash size={18} />}
              size="sm"
              variant="ghost"
              color="#607397"
              onClick={() => deleteLocation(row.id)}
            />
          )}
        />
      </AdminCard>
    </AdminStack>
  );
}

const ServiceabilityPage = () => {
  const location = useLocation();
  return location.pathname.includes("manual-serviceability") ? (
    <ManualServiceability />
  ) : (
    <ServiceabilityLocations />
  );
};

export default ServiceabilityPage;
