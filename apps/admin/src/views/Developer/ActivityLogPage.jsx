import {
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Input,
  Text,
} from "@chakra-ui/react";
import {
  IconAlertTriangle,
  IconCalendar,
  IconClockHour4,
  IconRefresh,
  IconSearch,
  IconShield,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";
import {
  AdminCard,
  AdminSelect,
  AdminStack,
  Metric,
  PageIntro,
  SearchInput,
  ToolbarCard,
} from "components/AdminUI/AdminPage";

export default function ActivityLogPage() {
  return (
    <AdminStack>
      <ToolbarCard p="25px">
        <Flex
          justify="space-between"
          align="center"
          gap="16px"
          wrap="wrap"
          pb="17px"
          borderBottom="1px solid #E5EAF3"
        >
          <HStack spacing="14px">
            <Box
              w="46px"
              h="46px"
              borderRadius="14px"
              bg="#F0EDFF"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="#6C5CE7"
            >
              <IconClockHour4 size={24} />
            </Box>
            <Box>
              <Text fontSize="22px" fontWeight="800">
                Activity Log
              </Text>
              <Text fontSize="15px" color="#607397">
                Every admin action across the platform — searchable, filterable,
                audit-ready.
              </Text>
            </Box>
          </HStack>
          <HStack spacing="22px" wrap="wrap">
            <Metric icon={IconSparkles} value={0} label="events on page" />
            <Metric
              icon={IconAlertTriangle}
              value={0}
              label="sensitive"
              color="#FF9C1A"
            />
            <Metric icon={IconUsers} value={0} label="actors" color="#00A881" />
            <Button leftIcon={<IconRefresh size={18} />} variant="outline">
              Refresh
            </Button>
          </HStack>
        </Flex>

        <Flex gap="10px" mt="16px" wrap="wrap">
          <SearchInput
            placeholder="Search by actor, seller, or action key..."
            maxW="820px"
          />
          <AdminSelect maxW="260px">
            <option>All categories</option>
          </AdminSelect>
          <HStack flex="1" minW="260px">
            <Input placeholder="From" h="40px" />
            <Text color="#A7B0BE">→</Text>
            <Input placeholder="To" h="40px" />
            <IconCalendar size={18} color="#A7B0BE" />
          </HStack>
        </Flex>
      </ToolbarCard>

      <AdminCard minH="360px">
        <Center minH="360px">
          <Box textAlign="center" maxW="430px">
            <IconClockHour4
              size={32}
              color="#6C5CE7"
              style={{ margin: "0 auto 36px" }}
            />
            <Text fontWeight="800" fontSize="18px">
              No activity recorded yet
            </Text>
            <Text color="#607397" mt="8px">
              Admin actions will start appearing here as your team uses the
              platform.
            </Text>
          </Box>
        </Center>
      </AdminCard>
    </AdminStack>
  );
}
