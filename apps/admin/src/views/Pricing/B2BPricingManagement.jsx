import { Box, Flex, HStack, IconButton, Switch, Text } from "@chakra-ui/react";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import {
  AdminCard,
  AdminSelect,
  AdminStack,
  DataTable,
  PrimaryButton,
  SearchInput,
  adminUi,
} from "components/AdminUI/AdminPage";
import { useState } from "react";

const tabs = [
  "Zones",
  "Pincodes",
  "Rate Matrix",
  "Additional Charges",
  "Quote Calculator",
];

const zoneRows = [
  {
    code: "A",
    name: "Zone A - Metro / Direct",
    description: "Direct delivery, metros and major hubs",
  },
  {
    code: "B",
    name: "Zone B - EDL1 / Tier 1",
    description: "Extra delivery level 1 - Tier 1 cities",
  },
  {
    code: "C",
    name: "Zone C - EDL2 / Tier 2",
    description: "Extra delivery level 2 - Tier 2 cities",
  },
  { code: "CRG_AMD", name: "Ahmedabad", description: "Ahmedabad / Gujarat" },
  { code: "CRG_BLR", name: "Bangalore", description: "Bangalore / Karnataka" },
  { code: "CRG_BOM", name: "Mumbai", description: "Mumbai" },
  { code: "CRG_CCU", name: "Kolkata", description: "Kolkata / West Bengal" },
  { code: "CRG_CHD", name: "Chandigarh", description: "Chandigarh / Punjab" },
];

const B2BPricingManagement = () => {
  const [activeTab, setActiveTab] = useState("Zones");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const columns = [
    { key: "code", label: "Code", w: "190px" },
    { key: "name", label: "Name", w: "220px" },
    { key: "description", label: "Description" },
    {
      key: "active",
      label: "Active",
      align: "center",
      render: () => <Switch colorScheme="purple" isChecked />,
    },
  ];

  return (
    <AdminStack spacing="20px">
      <AdminCard p="25px">
        <Text fontSize="26px" fontWeight="800" color={adminUi.text} mb="28px">
          B2B Pricing Management
        </Text>

        <HStack
          spacing="22px"
          borderBottom="1px solid"
          borderColor={adminUi.border}
          mb="26px"
          wrap="wrap"
        >
          {tabs.map((tab) => (
            <Box
              key={tab}
              pb="11px"
              borderBottom="3px solid"
              borderColor={activeTab === tab ? adminUi.purple : "transparent"}
              color={activeTab === tab ? adminUi.purple : "#333333"}
              cursor="pointer"
              onClick={() => setActiveTab(tab)}
            >
              <Text fontSize="19px" fontWeight="500">
                {tab}
              </Text>
            </Box>
          ))}
        </HStack>

        {activeTab === "Zones" ? (
          <>
            <Flex
              justify="space-between"
              align="center"
              mb="20px"
              gap="14px"
              wrap="wrap"
            >
              <HStack spacing="14px" wrap="wrap">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search code, name or descriptio..."
                  maxW="360px"
                />
                <AdminSelect value={status} onChange={setStatus} maxW="160px">
                  <option value="">Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </AdminSelect>
              </HStack>
              <PrimaryButton leftIcon={<IconPlus size={18} />}>
                Add Zone
              </PrimaryButton>
            </Flex>

            <DataTable
              columns={columns}
              rows={zoneRows}
              rowKey="code"
              minW="1040px"
              actions={() => (
                <HStack spacing="10px" justify="flex-end">
                  <IconButton
                    aria-label="Edit zone"
                    icon={<IconEdit size={18} />}
                    size="sm"
                    variant="outline"
                    borderColor="#D6DEE9"
                    bg="#FFFFFF"
                  />
                  <IconButton
                    aria-label="Delete zone"
                    icon={<IconTrash size={18} />}
                    size="sm"
                    variant="outline"
                    borderColor="#FFB5B5"
                    color="#FF3D3D"
                    bg="#FFFFFF"
                  />
                </HStack>
              )}
            />
          </>
        ) : (
          <Flex
            minH="420px"
            align="center"
            justify="center"
            color={adminUi.muted}
            fontSize="18px"
          >
            {activeTab} configuration will appear here.
          </Flex>
        )}
      </AdminCard>
    </AdminStack>
  );
};

export default B2BPricingManagement;
