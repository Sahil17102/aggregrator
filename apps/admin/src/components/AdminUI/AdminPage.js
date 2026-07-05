import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import { IconSearch } from "@tabler/icons-react";

export const adminUi = {
  pageTop: { base: "120px", md: "75px" },
  cardRadius: "20px",
  purple: "#6C5CE7",
  text: "#0F172A",
  muted: "#607397",
  border: "#E5EAF3",
  headerBg: "#F4F1FF",
};

export function AdminStack({ children, ...props }) {
  return (
    <Stack spacing="20px" pt={adminUi.pageTop} {...props}>
      {children}
    </Stack>
  );
}

export function AdminCard({ children, ...props }) {
  const bg = useColorModeValue("#FFFFFF", "#161B22");
  const border = useColorModeValue(adminUi.border, "#30363D");
  return (
    <Box
      bg={bg}
      border="1px solid"
      borderColor={border}
      borderRadius={adminUi.cardRadius}
      {...props}
    >
      {children}
    </Box>
  );
}

export function PageIntro({
  icon,
  title,
  subtitle,
  right,
  py = "22px",
  px = "26px",
}) {
  const titleColor = useColorModeValue(adminUi.text, "#E6EDF3");
  const mutedColor = useColorModeValue(adminUi.muted, "#8B949E");
  return (
    <AdminCard px={px} py={py}>
      <Flex justify="space-between" align="center" gap={4} wrap="wrap">
        <HStack spacing="16px" minW={0}>
          {icon ? (
            <Flex
              align="center"
              justify="center"
              w="46px"
              h="46px"
              borderRadius="14px"
              bg="#F0EDFF"
              color={adminUi.purple}
              flexShrink={0}
            >
              <Icon as={icon} boxSize="23px" strokeWidth={1.8} />
            </Flex>
          ) : null}
          <Box minW={0}>
            <Text
              fontSize="22px"
              fontWeight="800"
              color={titleColor}
              lineHeight="1.2"
              letterSpacing="0"
            >
              {title}
            </Text>
            {subtitle ? (
              <Text fontSize="15px" color={mutedColor} mt="3px" noOfLines={2}>
                {subtitle}
              </Text>
            ) : null}
          </Box>
        </HStack>
        {right ? <Box flexShrink={0}>{right}</Box> : null}
      </Flex>
    </AdminCard>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  maxW = "360px",
  ...props
}) {
  return (
    <InputGroup maxW={maxW} {...props}>
      <InputLeftElement pointerEvents="none" color="#6B7C98">
        <IconSearch size={18} />
      </InputLeftElement>
      <Input
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        h="40px"
        bg="#FFFFFF"
        borderColor="#D6DEE9"
        color={adminUi.text}
        fontSize="16px"
        fontWeight="500"
        _placeholder={{ color: "#A7B0BE" }}
      />
    </InputGroup>
  );
}

export function AdminSelect({
  value,
  onChange,
  children,
  maxW = "220px",
  ...props
}) {
  return (
    <Select
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      h="40px"
      maxW={maxW}
      bg="#FFFFFF"
      borderColor="#D6DEE9"
      fontSize="16px"
      fontWeight="500"
      {...props}
    >
      {children}
    </Select>
  );
}

export function ToolbarCard({ children, ...props }) {
  return (
    <AdminCard px="26px" py="16px" {...props}>
      {children}
    </AdminCard>
  );
}

export function Metric({ icon, value, label, color = adminUi.purple }) {
  return (
    <HStack spacing="8px" whiteSpace="nowrap">
      {icon ? (
        <Icon as={icon} boxSize="18px" color={color} strokeWidth={1.8} />
      ) : null}
      <Text fontSize="18px" fontWeight="800" color={adminUi.text}>
        {value}
      </Text>
      <Text fontSize="15px" color={adminUi.muted}>
        {label}
      </Text>
    </HStack>
  );
}

export function DataTable({
  columns,
  rows,
  loading,
  emptyText = "No records found",
  rowKey = "id",
  actions,
  footer,
  minW = "900px",
}) {
  return (
    <AdminCard overflow="hidden">
      <TableContainer>
        <Table variant="simple" minW={minW}>
          <Thead>
            <Tr>
              {columns.map((column) => (
                <Th
                  key={column.key}
                  bg={adminUi.headerBg}
                  color="#93A0BA"
                  fontSize="14px"
                  fontWeight="800"
                  letterSpacing="0"
                  textTransform="uppercase"
                  py="17px"
                  px="21px"
                  borderColor={adminUi.border}
                  textAlign={column.align || "left"}
                  w={column.w}
                >
                  {column.label}
                </Th>
              ))}
              {actions ? (
                <Th
                  bg={adminUi.headerBg}
                  color="#93A0BA"
                  fontSize="14px"
                  fontWeight="800"
                  letterSpacing="0"
                  textTransform="uppercase"
                  py="17px"
                  px="21px"
                  borderColor={adminUi.border}
                  textAlign="right"
                >
                  Action
                </Th>
              ) : null}
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <Tr>
                <Td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  py="56px"
                  textAlign="center"
                >
                  <Text color={adminUi.muted}>Loading...</Text>
                </Td>
              </Tr>
            ) : rows?.length ? (
              rows.map((row, index) => (
                <Tr key={row?.[rowKey] || row?.id || index}>
                  {columns.map((column) => (
                    <Td
                      key={column.key}
                      py="18px"
                      px="21px"
                      borderColor={adminUi.border}
                      color={adminUi.text}
                      fontSize="17px"
                      textAlign={column.align || "left"}
                    >
                      {column.render
                        ? column.render(row[column.key], row, index)
                        : row[column.key]}
                    </Td>
                  ))}
                  {actions ? (
                    <Td
                      py="18px"
                      px="21px"
                      borderColor={adminUi.border}
                      textAlign="right"
                    >
                      {actions(row)}
                    </Td>
                  ) : null}
                </Tr>
              ))
            ) : (
              <Tr>
                <Td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  py="64px"
                  textAlign="center"
                >
                  <Text color={adminUi.muted} fontSize="16px">
                    {emptyText}
                  </Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
      {footer ? (
        <Flex
          justify="flex-end"
          align="center"
          gap={3}
          px="21px"
          py="13px"
          borderTop="1px solid"
          borderColor={adminUi.border}
        >
          {footer}
        </Flex>
      ) : null}
    </AdminCard>
  );
}

export function SoftBadge({ children, colorScheme = "purple", ...props }) {
  return (
    <Badge
      colorScheme={colorScheme}
      borderRadius="7px"
      px="10px"
      py="4px"
      textTransform="none"
      fontSize="14px"
      fontWeight="600"
      {...props}
    >
      {children}
    </Badge>
  );
}

export function PrimaryButton(props) {
  return (
    <Button
      bg="linear-gradient(135deg, #7259E8 0%, #FF6B12 100%)"
      color="#FFFFFF"
      h="46px"
      px="22px"
      fontSize="18px"
      fontWeight="800"
      _hover={{ opacity: 0.92 }}
      {...props}
    />
  );
}
