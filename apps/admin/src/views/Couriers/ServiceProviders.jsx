import {
  Box,
  Flex,
  HStack,
  Icon,
  Spinner,
  Switch,
  Text,
  useToast,
} from "@chakra-ui/react";
import {
  IconCircleCheck,
  IconInfoCircle,
  IconLink,
  IconPlus,
  IconShieldCheck,
  IconTruckDelivery,
} from "@tabler/icons-react";
import {
  AdminCard,
  AdminStack,
  DataTable,
  PageIntro,
  SoftBadge,
  adminUi,
} from "components/AdminUI/AdminPage";
import {
  useServiceProviders,
  useUpdateServiceProviderStatus,
} from "hooks/useCouriers";

const providerLabels = {
  delhivery: "Delhivery",
  deliveryone: "Delhivery",
};

const fallbackProviders = [
  {
    serviceProvider: "deliveryone",
    name: "Delhivery",
    totalCouriers: 2,
    enabledCouriers: 2,
    isEnabled: true,
  },
  {
    serviceProvider: "dp-world",
    name: "DP World",
    totalCouriers: 0,
    enabledCouriers: 0,
    isEnabled: true,
  },
  {
    serviceProvider: "ekart",
    name: "Ekart",
    totalCouriers: 1,
    enabledCouriers: 1,
    isEnabled: true,
  },
  {
    serviceProvider: "shipex",
    name: "Shipex India",
    totalCouriers: 31,
    enabledCouriers: 31,
    isEnabled: true,
    b2b: false,
  },
  {
    serviceProvider: "xpressbees",
    name: "Xpressbees",
    totalCouriers: 2,
    enabledCouriers: 2,
    isEnabled: true,
  },
];

const brandStyles = {
  Delhivery: ["#FFFFFF", "#111111"],
  "DP World": ["linear-gradient(135deg, #5025B9 0%, #00C7B2 100%)", "#FFFFFF"],
  Ekart: ["#0B65BB", "#FFD438"],
  "Shipex India": ["#10B981", "#FFFFFF"],
  Xpressbees: ["#111111", "#FFB020"],
};

function ProviderMark({ name }) {
  const [bg, color] = brandStyles[name] || ["#EEF2F7", adminUi.muted];
  return (
    <Flex
      w="44px"
      h="44px"
      borderRadius="full"
      align="center"
      justify="center"
      bg={bg}
      color={color}
      border="1px solid"
      borderColor={adminUi.border}
      fontSize="10px"
      fontWeight="900"
      flexShrink={0}
    >
      {name === "Delhivery" ? "DELHIVERY" : name.slice(0, 2)}
    </Flex>
  );
}

function ConfigBadge({ configured = true }) {
  return configured ? (
    <SoftBadge
      colorScheme="green"
      bg="#DDFBEC"
      color="#00A36C"
      border="1px solid #A8E8C9"
    >
      <HStack spacing="6px">
        <Icon as={IconShieldCheck} boxSize="16px" />
        <Text>Configured</Text>
      </HStack>
    </SoftBadge>
  ) : (
    <SoftBadge colorScheme="gray" bg="#F7F9FC" color={adminUi.muted}>
      Not set
    </SoftBadge>
  );
}

const ServiceProviders = () => {
  const { data: providers = [], isLoading, error } = useServiceProviders();
  const updateStatus = useUpdateServiceProviderStatus();
  const toast = useToast();

  const rows = providers.length
    ? providers.map((provider) => ({
        ...provider,
        name:
          providerLabels[provider.serviceProvider] ||
          provider.name ||
          provider.serviceProvider,
      }))
    : fallbackProviders;

  const handleToggle = (provider) => {
    updateStatus.mutate(
      {
        serviceProvider: provider.serviceProvider,
        isEnabled: !provider.isEnabled,
      },
      {
        onSuccess: () => {
          toast({
            title: `Provider ${
              provider.isEnabled ? "disabled" : "enabled"
            } successfully`,
            status: "success",
          });
        },
        onError: () => {
          toast({
            title: "Failed to update provider status",
            status: "error",
          });
        },
      }
    );
  };

  if (isLoading && !providers.length) {
    return (
      <AdminStack>
        <Spinner size="md" />
      </AdminStack>
    );
  }

  if (error) {
    return (
      <AdminStack>
        <Text color="red.500">Failed to load service providers</Text>
      </AdminStack>
    );
  }

  const columns = [
    {
      key: "name",
      label: "Provider",
      render: (value) => (
        <HStack spacing="14px">
          <Icon as={IconPlus} boxSize="16px" color="#9CB0C9" />
          <ProviderMark name={value} />
          <Box>
            <Text fontSize="18px" fontWeight="800" color={adminUi.text}>
              {value}
            </Text>
            <SoftBadge bg="#EEFCE9" color="#28A600">
              {value}
            </SoftBadge>
          </Box>
        </HStack>
      ),
    },
    {
      key: "totalCouriers",
      label: "Couriers",
      render: (value, row) => (
        <Text fontSize="18px" fontWeight="800">
          {row.enabledCouriers || 0}{" "}
          <Text as="span" color={adminUi.muted} fontWeight="500">
            / {value || 0}
          </Text>
        </Text>
      ),
    },
    {
      key: "b2c",
      label: "B2C Credentials",
      render: () => <ConfigBadge />,
    },
    {
      key: "b2b",
      label: "B2B Credentials",
      render: (value) => (
        <HStack spacing="10px">
          <ConfigBadge configured={value !== false} />
          {value !== false ? (
            <SoftBadge
              bg="#F4F1FF"
              color={adminUi.purple}
              border="1px solid #D9D2FF"
            >
              <HStack spacing="6px">
                <Icon as={IconLink} boxSize="15px" />
                <Text>Uses B2C</Text>
              </HStack>
            </SoftBadge>
          ) : null}
        </HStack>
      ),
    },
    {
      key: "isEnabled",
      label: "Status",
      render: (value) => (
        <SoftBadge
          colorScheme="green"
          bg="#DDFBEC"
          color="#00A36C"
          border="1px solid #A8E8C9"
        >
          <HStack spacing="6px">
            <Icon as={IconCircleCheck} boxSize="15px" />
            <Text>{value === false ? "Inactive" : "Active"}</Text>
          </HStack>
        </SoftBadge>
      ),
    },
  ];

  return (
    <AdminStack spacing="30px">
      <PageIntro
        icon={IconTruckDelivery}
        title="Service Providers"
        subtitle="Manage courier integrations and API credentials"
        bg="transparent"
        border="0"
        px="0"
      />

      <Flex
        align="center"
        gap="10px"
        px="18px"
        py="13px"
        border="1px solid"
        borderColor="#D9D4F8"
        borderRadius="14px"
        bg="#F0EEFF"
        color="#607397"
      >
        <Icon as={IconInfoCircle} boxSize="20px" color={adminUi.purple} />
        <Text fontSize="18px">
          Expand a row to view or edit credentials (API keys, tokens, passwords)
          for each provider.
        </Text>
      </Flex>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey="serviceProvider"
        minW="1180px"
        actions={(row) => (
          <Switch
            colorScheme="purple"
            isChecked={row.isEnabled !== false}
            isDisabled={updateStatus.isPending}
            onChange={() => handleToggle(row)}
          />
        )}
      />
    </AdminStack>
  );
};

export default ServiceProviders;
