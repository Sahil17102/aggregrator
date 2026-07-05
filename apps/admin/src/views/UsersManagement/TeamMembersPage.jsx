import {
  Avatar,
  Box,
  Flex,
  HStack,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  IconMail,
  IconPhone,
  IconPlus,
  IconShieldCheck,
  IconUserCog,
  IconUsers,
} from "@tabler/icons-react";
import {
  AdminCard,
  AdminSelect,
  AdminStack,
  Metric,
  PageIntro,
  PrimaryButton,
  SearchInput,
  SoftBadge,
  ToolbarCard,
} from "components/AdminUI/AdminPage";
import { useState } from "react";

const members = [
  {
    id: "1",
    initials: "RC",
    name: "RANJANA CHANDRAKAR",
    role: "Sales / Onboarding",
    email: "ranjanachandrakar959@gmail.com",
    phone: "9617149819",
    sellers: 2,
    permissions: 29,
    lastActive: "4 May 2026",
  },
  {
    id: "2",
    initials: "HA",
    name: "Harshita",
    role: "Account Manager",
    email: "harshitarajpaldev@gmail.com",
    phone: "9664476955",
    sellers: 2,
    permissions: 30,
    lastActive: "3 May 2026",
  },
];

export default function TeamMembersPage() {
  const [search, setSearch] = useState("");
  const filtered = members.filter((member) =>
    `${member.name} ${member.email} ${member.phone} ${member.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <AdminStack>
      <PageIntro
        icon={IconUserCog}
        title="Team Members"
        subtitle="Create staff accounts, assign sellers, and decide what each person can do."
        right={
          <HStack spacing="26px" wrap="wrap">
            <Metric icon={IconUsers} value={members.length} label="total" />
            <Metric
              icon={IconShieldCheck}
              value={members.length}
              label="active"
              color="#00A881"
            />
            <PrimaryButton leftIcon={<IconPlus size={18} />}>
              Add team member
            </PrimaryButton>
          </HStack>
        }
      />

      <ToolbarCard>
        <Flex gap="10px" wrap="wrap">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, email, phone, designation"
            maxW="560px"
          />
          <AdminSelect defaultValue="" maxW="200px">
            <option value="">All statuses</option>
            <option value="active">Active</option>
          </AdminSelect>
        </Flex>
      </ToolbarCard>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing="20px" maxW="1035px">
        {filtered.map((member) => (
          <AdminCard key={member.id} p="25px">
            <HStack align="flex-start" spacing="18px">
              <Avatar
                name={member.initials}
                size="lg"
                bg="linear-gradient(135deg, #7259E8 0%, #F47A39 100%)"
                color="#FFFFFF"
                fontWeight="800"
              />
              <Box flex="1">
                <HStack spacing="14px" mb="5px">
                  <Text fontSize="18px" fontWeight="800">
                    {member.name}
                  </Text>
                  <SoftBadge colorScheme="green">Active</SoftBadge>
                </HStack>
                <Text color="#607397" fontSize="15px">
                  {member.role}
                </Text>
              </Box>
            </HStack>

            <Stack spacing="9px" mt="25px" color="#607397" fontSize="15px">
              <HStack>
                <IconMail size={16} />
                <Text>{member.email}</Text>
              </HStack>
              <HStack>
                <IconPhone size={16} />
                <Text>{member.phone}</Text>
              </HStack>
            </Stack>

            <SimpleGrid columns={2} spacing="14px" mt="22px">
              <AdminCard p="14px 16px" borderRadius="16px" bg="#FAFBFE">
                <Text color="#607397" fontSize="13px">
                  Sellers
                </Text>
                <Text fontSize="22px" fontWeight="800">
                  {member.sellers}
                </Text>
              </AdminCard>
              <AdminCard p="14px 16px" borderRadius="16px" bg="#FAFBFE">
                <Text color="#607397" fontSize="13px">
                  Permissions
                </Text>
                <Text fontSize="22px" fontWeight="800">
                  {member.permissions}
                </Text>
              </AdminCard>
            </SimpleGrid>

            <Flex
              mt="16px"
              pt="13px"
              borderTop="1px solid #E5EAF3"
              justify="space-between"
              color="#607397"
              fontSize="13px"
            >
              <Text>Manager</Text>
              <Text>Last active {member.lastActive}</Text>
            </Flex>
          </AdminCard>
        ))}
      </SimpleGrid>
    </AdminStack>
  );
}
