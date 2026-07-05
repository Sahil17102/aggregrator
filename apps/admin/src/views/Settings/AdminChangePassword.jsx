import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  SimpleGrid,
  Text,
  useToast,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {
  IconAlertTriangle,
  IconKey,
  IconMail,
  IconShieldCheck,
  IconUserCircle,
} from "@tabler/icons-react";
import {
  AdminCard,
  AdminStack,
  PageIntro,
  PrimaryButton,
  SoftBadge,
  adminUi,
} from "components/AdminUI/AdminPage";
import { useState } from "react";
import { changeAdminPassword } from "services/auth.service";
import { useAuthStore } from "store/useAuthStore";

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

function PasswordField({
  label,
  placeholder,
  value,
  onChange,
  error,
  visible,
  onToggle,
}) {
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel
        fontSize="15px"
        color={adminUi.muted}
        fontWeight="600"
        mb="8px"
      >
        {label}
      </FormLabel>
      <InputGroup>
        <Input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          h="40px"
          borderColor="#D6DEE9"
          fontSize="17px"
          _placeholder={{ color: "#B5BBC5" }}
        />
        <InputRightElement h="40px">
          <Button variant="ghost" size="sm" onClick={onToggle} color="#607397">
            {visible ? <ViewOffIcon /> : <ViewIcon />}
          </Button>
        </InputRightElement>
      </InputGroup>
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
}

function getInitials(name, email) {
  const source = name || email || "Admin User";
  const words = source
    .replace(/@.*/, "")
    .split(/[\s._-]+/)
    .filter(Boolean);

  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default function AdminChangePassword() {
  const toast = useToast();
  const { user, userId } = useAuthStore();
  const adminName =
    user?.name ||
    user?.username ||
    user?.fullName ||
    user?.email?.split("@")?.[0] ||
    "Admin User";
  const adminEmail = user?.email || "Signed-in admin";
  const adminRole = user?.role || "SUPERADMIN";
  const initials = getInitials(adminName, adminEmail);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [visibility, setVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const validate = () => {
    const nextErrors = {};

    if (!form.currentPassword.trim())
      nextErrors.currentPassword = "Current password is required";
    if (!form.newPassword.trim()) {
      nextErrors.newPassword = "New password is required";
    } else if (!strongPasswordRegex.test(form.newPassword)) {
      nextErrors.newPassword = "Must be 8+ chars with upper, lower, number";
    }

    if (!form.confirmPassword.trim()) {
      nextErrors.confirmPassword = "Please confirm your new password";
    } else if (form.newPassword !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    if (
      form.currentPassword &&
      form.newPassword &&
      form.currentPassword === form.newPassword
    ) {
      nextErrors.newPassword =
        "New password must be different from current password";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await changeAdminPassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      toast({
        title: "Password changed",
        description: "Your admin password has been updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});
    } catch (error) {
      toast({
        title: "Failed to change password",
        description: error?.response?.data?.error || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (key, value) =>
    setForm((previous) => ({ ...previous, [key]: value }));
  const toggleVisibility = (key) =>
    setVisibility((previous) => ({ ...previous, [key]: !previous[key] }));

  return (
    <AdminStack spacing="25px">
      <PageIntro
        icon={IconUserCircle}
        title="Account"
        subtitle="Your profile and security settings."
      />

      <SimpleGrid
        columns={{ base: 1, xl: 2 }}
        spacing="25px"
        templateColumns={{ xl: "1fr 2fr" }}
      >
        <Box>
          <AdminCard minH="249px" p="25px">
            <Flex
              direction="column"
              align="center"
              justify="center"
              h="100%"
              minH="199px"
            >
              <Flex
                w="80px"
                h="80px"
                borderRadius="full"
                align="center"
                justify="center"
                bg="linear-gradient(135deg, #7259E8 0%, #FF6B12 100%)"
                color="#FFFFFF"
                fontSize="28px"
                fontWeight="800"
              >
                {initials}
              </Flex>
              <Text
                fontSize="22px"
                fontWeight="800"
                color={adminUi.text}
                mt="18px"
              >
                {adminName}
              </Text>
              <SoftBadge
                colorScheme="orange"
                mt="9px"
                color="#C86C00"
                bg="#FFF1C7"
              >
                <HStack spacing="4px">
                  <Icon as={IconShieldCheck} boxSize="13px" />
                  <Text>{String(adminRole).toUpperCase()}</Text>
                </HStack>
              </SoftBadge>
              <HStack spacing="12px" mt="26px" color={adminUi.text}>
                <Icon as={IconMail} boxSize="18px" color="#607397" />
                <Text fontSize="16px" fontWeight="600">
                  {adminEmail}
                </Text>
              </HStack>
              {userId ? (
                <Text fontSize="13px" color={adminUi.muted} mt="8px">
                  ID: {userId}
                </Text>
              ) : null}
            </Flex>
          </AdminCard>

          <AdminCard mt="20px" p="20px">
            <Text fontSize="15px" color={adminUi.muted} lineHeight="1.6">
              Your name, email, and phone can only be updated by a superadmin.
              <br />
              Need a change? Reach out to your administrator.
            </Text>
          </AdminCard>
        </Box>

        <AdminCard p="30px">
          <HStack spacing="10px">
            <Icon
              as={IconKey}
              boxSize="20px"
              color={adminUi.purple}
              strokeWidth={1.9}
            />
            <Text fontSize="20px" fontWeight="800" color={adminUi.text}>
              Change password
            </Text>
          </HStack>
          <Text fontSize="15px" color={adminUi.muted} mt="6px" mb="27px">
            Pick a strong password - at least 8 characters, mix of letters,
            numbers, and symbols recommended.
          </Text>

          <Box maxW="560px">
            <PasswordField
              label="Current password *"
              placeholder="Enter your current password"
              value={form.currentPassword}
              error={errors.currentPassword}
              visible={visibility.currentPassword}
              onChange={(value) => updateForm("currentPassword", value)}
              onToggle={() => toggleVisibility("currentPassword")}
            />
            <Box mt="22px">
              <PasswordField
                label="New password *"
                placeholder="At least 8 characters"
                value={form.newPassword}
                error={errors.newPassword}
                visible={visibility.newPassword}
                onChange={(value) => updateForm("newPassword", value)}
                onToggle={() => toggleVisibility("newPassword")}
              />
            </Box>
            <Box mt="22px">
              <PasswordField
                label="Confirm new password *"
                placeholder="Type it again to confirm"
                value={form.confirmPassword}
                error={errors.confirmPassword}
                visible={visibility.confirmPassword}
                onChange={(value) => updateForm("confirmPassword", value)}
                onToggle={() => toggleVisibility("confirmPassword")}
              />
            </Box>

            <Flex
              mt="20px"
              p="16px"
              border="1px solid"
              borderColor="#FFE19E"
              borderRadius="14px"
              bg="#FFF9E6"
              gap="10px"
              color="#C95F00"
            >
              <Icon
                as={IconAlertTriangle}
                boxSize="18px"
                mt="2px"
                flexShrink={0}
              />
              <Text fontSize="15px" lineHeight="1.45">
                After changing your password, you'll be signed out everywhere
                and need to sign in again with the new password.
              </Text>
            </Flex>

            <Flex justify="center" mt="30px">
              <PrimaryButton
                leftIcon={<IconKey size={18} />}
                onClick={onSubmit}
                isLoading={loading}
                loadingText="Updating..."
              >
                Update password
              </PrimaryButton>
            </Flex>
          </Box>
        </AdminCard>
      </SimpleGrid>
    </AdminStack>
  );
}
