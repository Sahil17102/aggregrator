import {
  Box,
  Flex,
  HStack,
  Icon,
  IconButton,
  Switch,
  Text,
} from "@chakra-ui/react";
import {
  IconCircleCheck,
  IconCircleX,
  IconEdit,
  IconGlobe,
  IconLayersLinked,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import {
  AdminCard,
  AdminStack,
  DataTable,
  Metric,
  PrimaryButton,
  SearchInput,
  adminUi,
} from "components/AdminUI/AdminPage";
import { useState } from "react";

const zoneRows = [
  {
    code: "METRO_TO_METRO",
    name: "Metro to Metro",
    description: "Shipment between two different metro cities",
    active: true,
  },
  {
    code: "ROI",
    name: "ROI",
    description: "Rest of India - default zone when no other zone matches",
    active: true,
  },
  {
    code: "SPECIAL_ZONE",
    name: "Special Zone",
    description:
      "Origin or destination is in a special zone (e.g. remote/restricted areas)",
    active: true,
  },
  {
    code: "WITHIN_CITY",
    name: "Within City",
    description: "Origin and destination are in the same city",
    active: true,
  },
  {
    code: "WITHIN_REGION",
    name: "Within Region",
    description:
      "Origin and destination are in the same region (North/South/East/West)",
    active: true,
  },
  {
    code: "WITHIN_STATE",
    name: "Within State",
    description: "Origin and destination are in the same state",
    active: true,
  },
];

const B2CPricingManagement = () => {
  const [activeTab, setActiveTab] = useState("zones");
  const [search, setSearch] = useState("");

  const columns = [
    { key: "code", label: "Code" },
    { key: "name", label: "Name" },
    { key: "description", label: "Description" },
    {
      key: "active",
      label: "Status",
      align: "center",
      render: (value) => <Switch colorScheme="purple" isChecked={value} />,
    },
  ];

  return (
    <AdminStack spacing="20px">
      <AdminCard p="25px">
        <HStack
          spacing="32px"
          borderBottom="1px solid"
          borderColor={adminUi.border}
          mb="22px"
        >
          {["zones", "pricing"].map((tab) => (
            <Box
              key={tab}
              pb="14px"
              borderBottom="3px solid"
              borderColor={activeTab === tab ? adminUi.purple : "transparent"}
              color={activeTab === tab ? adminUi.purple : adminUi.text}
              cursor="pointer"
              onClick={() => setActiveTab(tab)}
            >
              <Text fontSize="20px" fontWeight="500">
                {tab === "zones" ? "Zones" : "Pricing"}
              </Text>
            </Box>
          ))}
        </HStack>

        {activeTab === "zones" ? (
          <>
            <Flex
              justify="space-between"
              align="center"
              gap="16px"
              wrap="wrap"
              mb="16px"
            >
              <HStack spacing="16px">
                <Flex
                  align="center"
                  justify="center"
                  w="46px"
                  h="46px"
                  borderRadius="14px"
                  bg="#F0EDFF"
                  color={adminUi.purple}
                >
                  <Icon as={IconLayersLinked} boxSize="25px" />
                </Flex>
                <Box>
                  <Text fontSize="22px" fontWeight="800" color={adminUi.text}>
                    B2C Zones
                  </Text>
                  <Text fontSize="16px" color={adminUi.muted}>
                    Manage shipping zones used for pricing configuration
                  </Text>
                </Box>
              </HStack>
              <HStack spacing="22px" wrap="wrap">
                <Metric
                  icon={IconGlobe}
                  value="6"
                  label="total"
                  color={adminUi.purple}
                />
                <Metric
                  icon={IconCircleCheck}
                  value="6"
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
            </Flex>

            <Flex
              justify="space-between"
              align="center"
              gap="14px"
              wrap="wrap"
              borderTop="1px solid"
              borderColor={adminUi.border}
              pt="20px"
              mb="20px"
            >
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search zones..."
                maxW="320px"
              />
              <HStack spacing="12px">
                <Text color={adminUi.muted} fontSize="16px">
                  6 results
                </Text>
                <PrimaryButton leftIcon={<IconPlus size={18} />}>
                  Add Zone
                </PrimaryButton>
              </HStack>
            </Flex>

            <DataTable
              columns={columns}
              rows={zoneRows}
              rowKey="code"
              minW="1000px"
              footer={
                <>
                  <Text color="#93A0BA" fontSize="22px">
                    ‹
                  </Text>
                  <Flex
                    w="40px"
                    h="40px"
                    borderRadius="9px"
                    align="center"
                    justify="center"
                    bg="#E8E2FF"
                    color={adminUi.purple}
                    fontWeight="700"
                  >
                    1
                  </Flex>
                  <Text color="#93A0BA" fontSize="22px">
                    ›
                  </Text>
                  <Box
                    h="40px"
                    minW="146px"
                    border="1px solid"
                    borderColor="#D6DEE9"
                    borderRadius="9px"
                    px="14px"
                    display="flex"
                    alignItems="center"
                    fontSize="17px"
                  >
                    50 / page
                  </Box>
                </>
              }
              actions={() => (
                <HStack spacing="14px" justify="flex-end">
                  <IconButton
                    aria-label="Edit zone"
                    icon={<IconEdit size={18} />}
                    size="sm"
                    variant="ghost"
                  />
                  <IconButton
                    aria-label="Delete zone"
                    icon={<IconTrash size={18} />}
                    size="sm"
                    variant="ghost"
                    color="#607397"
                  />
                </HStack>
              )}
            />
          </>
        ) : (
          <Flex
            minH="320px"
            align="center"
            justify="center"
            color={adminUi.muted}
            fontSize="18px"
          >
            Select a courier rate card to configure B2C pricing.
          </Flex>
        )}
      </AdminCard>
    </AdminStack>
  );
};

export default B2CPricingManagement;
