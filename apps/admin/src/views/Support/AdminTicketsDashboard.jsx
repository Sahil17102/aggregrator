import { Box, Button, Flex, HStack, Text } from "@chakra-ui/react";
import { IconMessageCircle } from "@tabler/icons-react";
import { AdminStack, DataTable, SoftBadge } from "components/AdminUI/AdminPage";
import { useAdminTickets } from "hooks/useTickets";
import moment from "moment";
import { useMemo, useState } from "react";

const statusItems = ["All", "Open", "Pending", "Resolved", "Closed"];

const priorityScheme = (value = "") => {
  if (value.toLowerCase() === "urgent" || value.toLowerCase() === "high")
    return "red";
  if (value.toLowerCase() === "medium") return "blue";
  return "gray";
};

const statusScheme = (value = "") => {
  if (value.toLowerCase() === "open") return "green";
  if (
    value.toLowerCase() === "pending" ||
    value.toLowerCase() === "in_progress"
  )
    return "orange";
  if (value.toLowerCase() === "closed") return "gray";
  return "blue";
};

export default function AdminTicketDashboard() {
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [status, setStatus] = useState("All");

  const { data, isLoading } = useAdminTickets({
    page,
    limit: perPage,
    filters: {
      status:
        status === "All"
          ? []
          : [
              status.toLowerCase() === "pending"
                ? "in_progress"
                : status.toLowerCase(),
            ],
      sortBy: "latest",
    },
  });

  const tickets = data?.data || [];
  const totalCount = data?.totalCount || tickets.length;

  const rows = useMemo(
    () =>
      tickets.map((ticket) => ({
        ...ticket,
        ticket: ticket.id || ticket.ticketId,
        seller:
          ticket.sellerName ||
          ticket.userName ||
          ticket.companyName ||
          ticket.user?.companyInfo?.businessName,
        sellerEmail: ticket.userEmail || ticket.user?.email,
        categoryLabel: ticket.category || "General",
        priorityLabel:
          ticket.priority || (ticket.status === "open" ? "MEDIUM" : "URGENT"),
        lastActivity: ticket.updatedAt || ticket.createdAt,
      })),
    [tickets]
  );

  return (
    <AdminStack>
      <Flex
        justify="space-between"
        align="flex-end"
        gap="20px"
        wrap="wrap"
        px="30px"
      >
        <HStack align="flex-start" spacing="12px">
          <Box color="#6C5CE7" pt="7px">
            <IconMessageCircle size={25} />
          </Box>
          <Box>
            <Text fontSize="28px" fontWeight="800">
              Support tickets
            </Text>
            <Text color="#607397">
              Conversations from sellers needing help.
            </Text>
          </Box>
        </HStack>
        <HStack spacing="0" bg="#F1F1F4" borderRadius="8px" p="2px">
          {statusItems.map((item) => (
            <Button
              key={item}
              h="37px"
              px="15px"
              variant="ghost"
              bg={status === item ? "#FFFFFF" : "transparent"}
              color={status === item ? "#0F172A" : "#666"}
              boxShadow={
                status === item ? "0 1px 5px rgba(15,23,42,0.08)" : "none"
              }
              onClick={() => {
                setStatus(item);
                setPage(1);
              }}
            >
              {item}
            </Button>
          ))}
        </HStack>
      </Flex>

      <DataTable
        loading={isLoading}
        rows={rows}
        columns={[
          {
            key: "ticket",
            label: "Ticket",
            render: (value, row) => (
              <Box>
                <Text fontWeight="800">{value || "—"}</Text>
                <Text color="#607397" fontSize="14px" noOfLines={1}>
                  {row.subject || "—"}
                </Text>
              </Box>
            ),
          },
          {
            key: "seller",
            label: "Seller",
            render: (value, row) => (
              <Box>
                <Text fontWeight="600">{value || "—"}</Text>
                <Text color="#607397" fontSize="14px" noOfLines={1}>
                  {row.sellerEmail || "—"}
                </Text>
              </Box>
            ),
          },
          { key: "categoryLabel", label: "Category" },
          {
            key: "priorityLabel",
            label: "Priority",
            render: (value) => (
              <SoftBadge colorScheme={priorityScheme(value)}>
                {String(value || "MEDIUM").toUpperCase()}
              </SoftBadge>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (value) => (
              <SoftBadge colorScheme={statusScheme(value)}>
                {String(value || "open")
                  .replace("_", " ")
                  .toUpperCase()}
              </SoftBadge>
            ),
          },
          {
            key: "lastActivity",
            label: "Last activity",
            render: (value) =>
              value ? moment(value).format("DD/MM/YYYY, HH:mm:ss") : "—",
          },
        ]}
        footer={
          <>
            <Button
              size="sm"
              variant="ghost"
              isDisabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              ‹
            </Button>
            <SoftBadge colorScheme="purple">{page}</SoftBadge>
            <Button
              size="sm"
              variant="ghost"
              isDisabled={page * perPage >= totalCount}
              onClick={() => setPage((value) => value + 1)}
            >
              ›
            </Button>
          </>
        }
        minW="1100px"
      />
    </AdminStack>
  );
}
