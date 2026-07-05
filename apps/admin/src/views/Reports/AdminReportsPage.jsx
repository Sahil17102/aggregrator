import {
  Box,
  Button,
  Flex,
  HStack,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  IconChevronDown,
  IconFileText,
  IconFilter,
  IconSparkles,
} from "@tabler/icons-react";
import {
  AdminCard,
  AdminStack,
  PageIntro,
  SoftBadge,
} from "components/AdminUI/AdminPage";

const presets = [
  [
    "Platform Overview",
    "Cross-merchant order, status, courier and delivery snapshot",
  ],
  [
    "Revenue & Billing",
    "All charges, freight, COD, and totals across merchants",
  ],
  [
    "Courier Performance",
    "Track delivery times, NDR and RTO outcomes by courier",
  ],
  ["NDR & RTO Audit", "Failed deliveries and returns for ops review"],
  ["All Fields", "Export everything"],
];

const sections = [
  [
    "Order Details",
    "Basic order information",
    [
      "Order ID",
      "Order Date",
      "Order Type",
      "Payment Type",
      "Status",
      "AWB Number",
      "Courier Partner",
    ],
  ],
  [
    "Customer & Delivery",
    "Customer info and delivery address",
    [
      "Customer Name",
      "Customer Phone",
      "Customer Email",
      "Delivery City",
      "Delivery State",
      "Delivery Pincode",
      "Address Line 1",
      "Address Line 2",
    ],
  ],
  [
    "Package Dimensions",
    "Weight and dimensions",
    [
      "Weight (g)",
      "Length (cm)",
      "Breadth (cm)",
      "Height (cm)",
      "Chargeable Weight (g)",
    ],
  ],
];

export default function AdminReportsPage() {
  return (
    <AdminStack>
      <PageIntro
        icon={IconFileText}
        title="Reports"
        subtitle="Build cross-merchant reports by selecting fields and filters, then download as CSV"
      />

      <AdminCard p="25px">
        <HStack spacing="10px" mb="16px">
          <IconSparkles size={20} color="#6C5CE7" />
          <Text fontSize="18px" fontWeight="800">
            Quick Presets
          </Text>
          <Text color="#607397">— start with a template</Text>
        </HStack>
        <SimpleGrid columns={{ base: 1, md: 2, xl: 5 }} spacing="10px">
          {presets.map(([title, body]) => (
            <AdminCard key={title} p="18px 16px" borderRadius="16px">
              <Text fontWeight="800" mb="4px">
                {title}
              </Text>
              <Text fontSize="14px" color="#607397" lineHeight="1.35">
                {body}
              </Text>
            </AdminCard>
          ))}
        </SimpleGrid>
      </AdminCard>

      <SimpleGrid columns={{ base: 1, xl: "2fr 1fr" }} spacing="24px">
        <AdminCard p="25px">
          <Flex justify="space-between" align="center" mb="20px">
            <HStack>
              <IconFileText size={20} color="#6C5CE7" />
              <Text fontSize="19px" fontWeight="800">
                Select Fields
              </Text>
            </HStack>
            <Button variant="ghost" color="#6C5CE7" size="sm">
              Select all
            </Button>
          </Flex>
          <Stack spacing="10px">
            {sections.map(([title, subtitle, tags]) => (
              <AdminCard key={title} overflow="hidden" borderRadius="16px">
                <Flex
                  bg="#FAFBFE"
                  px="20px"
                  py="17px"
                  align="center"
                  justify="space-between"
                >
                  <HStack spacing="12px">
                    <Box
                      w="20px"
                      h="20px"
                      border="2px solid #DCE5F2"
                      borderRadius="6px"
                    />
                    <Text fontWeight="800">{title}</Text>
                    <Text fontSize="13px" color="#607397">
                      {subtitle}
                    </Text>
                  </HStack>
                  <IconChevronDown size={18} color="#607397" />
                </Flex>
                <HStack spacing="8px" p="14px 20px" wrap="wrap">
                  {tags.map((tag) => (
                    <SoftBadge
                      key={tag}
                      colorScheme="gray"
                      borderRadius="999px"
                      bg="#FFFFFF"
                    >
                      {tag}
                    </SoftBadge>
                  ))}
                </HStack>
              </AdminCard>
            ))}
          </Stack>
        </AdminCard>

        <AdminCard p="25px">
          <HStack mb="17px">
            <IconFilter size={20} color="#6C5CE7" />
            <Text fontSize="19px" fontWeight="800">
              Filters
            </Text>
          </HStack>
          <Stack spacing="19px">
            <Box>
              <Text fontSize="14px" color="#41557A" mb="7px">
                Merchant — leave empty for all
              </Text>
              <AdminCard py="6px" px="12px" borderRadius="9px">
                <Text color="#A7B0BE">All merchants</Text>
              </AdminCard>
            </Box>
            <Box>
              <Text fontSize="14px" color="#41557A" mb="9px">
                Date Range
              </Text>
              <HStack wrap="wrap">
                {[
                  "Today",
                  "Last 7 days",
                  "Last 30 days",
                  "Last 90 days",
                  "Last 6 months",
                  "Custom",
                ].map((item) => (
                  <SoftBadge
                    key={item}
                    colorScheme={item === "Last 30 days" ? "purple" : "gray"}
                    borderRadius="999px"
                  >
                    {item}
                  </SoftBadge>
                ))}
              </HStack>
            </Box>
            <Box>
              <Text fontSize="14px" color="#41557A" mb="9px">
                Order Type
              </Text>
              <SimpleGrid columns={3} spacing="8px">
                {["All", "B2B", "B2C"].map((item) => (
                  <SoftBadge
                    key={item}
                    colorScheme={item === "All" ? "purple" : "gray"}
                    textAlign="center"
                  >
                    {item}
                  </SoftBadge>
                ))}
              </SimpleGrid>
            </Box>
            <Box>
              <Text fontSize="14px" color="#41557A" mb="9px">
                Order Status
              </Text>
              <HStack wrap="wrap">
                {[
                  "Pending",
                  "Processing",
                  "Booked",
                  "Pickup Initiated",
                  "Shipped",
                  "In Transit",
                  "Out for Delivery",
                  "Delivered",
                  "NDR",
                  "RTO Initiated",
                  "RTO Delivered",
                  "Cancelled",
                ].map((item) => (
                  <SoftBadge key={item} colorScheme="gray" borderRadius="999px">
                    {item}
                  </SoftBadge>
                ))}
              </HStack>
            </Box>
          </Stack>
        </AdminCard>
      </SimpleGrid>
    </AdminStack>
  );
}
