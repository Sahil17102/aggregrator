import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  FormControl,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  SimpleGrid,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import {
  IconChartBar,
  IconLock,
  IconMail,
  IconSettings,
  IconShield,
  IconUsers,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { loginAdmin } from "../../services/auth.service";
import { useAuthStore } from "../../store/useAuthStore";
import { brandIdentity } from "../../theme/brand";

function isTokenValid(token) {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const history = useHistory();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast({
        title: "Enter email and password",
        description: "Use your admin credentials to continue.",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      const data = await loginAdmin(email, password);

      const adminUser = data?.user || data?.admin || null;
      login(data.token, adminUser?.id, data.refreshToken, adminUser);

      toast({
        title: "Login successful",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      history.push("/admin/dashboard");
    } catch (err) {
      const status = err?.response?.status;

      toast({
        title:
          status === 401 ? "Invalid email or password" : "Unable to sign in",
        description:
          status === 401
            ? "Please use a valid admin account."
            : "Please try again in a moment.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (accessToken && refreshToken && isTokenValid(refreshToken)) {
      history.replace("/admin/dashboard");
    }
  }, [history]);

  const featureCards = [
    {
      title: "Secure Access",
      description: "Role-based access control for admin operations",
      icon: IconShield,
    },
    {
      title: "User Management",
      description: "Manage users, plans and permissions",
      icon: IconUsers,
    },
    {
      title: "Analytics",
      description: "Real-time insights and reporting dashboard",
      icon: IconChartBar,
    },
    {
      title: "System Control",
      description: "Configure couriers, rates and serviceability",
      icon: IconSettings,
    },
  ];

  return (
    <Flex
      minH="100vh"
      bg="#0E131A"
      align="stretch"
      justify="stretch"
      position="relative"
      overflow={{ base: "auto", lg: "hidden" }}
      fontFamily="'Plus Jakarta Sans', sans-serif"
    >
      <Flex
        as={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        w="100%"
      >
        <Flex
          display={{ base: "none", lg: "flex" }}
          w={{ lg: "45%", xl: "42%" }}
          minH="100vh"
          bg="linear-gradient(135deg, #070C12 0%, #141A22 100%)"
          color="white"
          direction="column"
          justify="space-between"
          position="relative"
          overflow="hidden"
          p={{ lg: 10, xl: 14 }}
        >
          <Box position="relative" zIndex="1">
            <HStack
              as="a"
              href="/"
              spacing="10px"
              mb="64px"
              align="center"
              textDecoration="none"
              _hover={{ textDecoration: "none" }}
            >
              <Box
                as="img"
                src={brandIdentity.logoPath}
                alt={brandIdentity.name}
                h="80px"
                w="80px"
                objectFit="contain"
                flexShrink="0"
              />
              <Text
                color="#FFFFFF"
                fontSize="24px"
                fontWeight="700"
                lineHeight="1"
                whiteSpace="nowrap"
              >
                {brandIdentity.name} Admin
              </Text>
            </HStack>

            <Box>
              <Heading
                as="h1"
                color="#FFFFFF"
                fontSize={{ lg: "30px", xl: "36px" }}
                fontWeight="700"
                lineHeight="1.22"
                letterSpacing="0"
                mb="16px"
              >
                Ship Aggregator
                <Text
                  as="span"
                  display="block"
                  bgGradient="linear(to-r, #FF7A1A, #FF8F34)"
                  bgClip="text"
                >
                  Admin Panel
                </Text>
              </Heading>
              <Text
                color="rgba(255,255,255,0.5)"
                fontSize="14px"
                lineHeight="1.65"
                maxW="384px"
              >
                Manage your courier aggregation platform &mdash; users,
                couriers, rates, serviceability, and more.
              </Text>
            </Box>
          </Box>

          <SimpleGrid columns={2} spacing={3} position="relative" zIndex="1">
            {featureCards.map((card) => {
              const FeatureIcon = card.icon;
              return (
                <Box
                  key={card.title}
                  bg="rgba(255,255,255,0.06)"
                  border="1px solid"
                  borderColor="rgba(255,255,255,0.08)"
                  borderRadius="12px"
                  p="16px"
                  backdropFilter="blur(8px)"
                >
                  <Box
                    w="36px"
                    h="36px"
                    borderRadius="8px"
                    bg="rgba(255,122,26,0.2)"
                    color="#FF7A1A"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mb="12px"
                  >
                    <Box as={FeatureIcon} size={20} strokeWidth={2} />
                  </Box>
                  <Text
                    color="#FFFFFF"
                    fontSize="14px"
                    fontWeight="600"
                    lineHeight="1.25"
                    mb="2px"
                  >
                    {card.title}
                  </Text>
                  <Text
                    color="rgba(255,255,255,0.4)"
                    fontSize="12px"
                    lineHeight="1.6"
                  >
                    {card.description}
                  </Text>
                </Box>
              );
            })}
          </SimpleGrid>
        </Flex>

        <Flex flex="1" minH="100vh" bg="#171C23" direction="column">
          <HStack
            as="a"
            href="/"
            display={{ base: "flex", lg: "none" }}
            align="center"
            spacing="10px"
            h="64px"
            w="100%"
            px="20px"
            borderBottom="1px solid"
            borderColor="#272E38"
            textDecoration="none"
            _hover={{ textDecoration: "none" }}
          >
            <Box
              as="img"
              src={brandIdentity.logoPath}
              alt={brandIdentity.name}
              h="40px"
              w="40px"
              objectFit="contain"
              flexShrink="0"
            />
            <Text
              color="#FFFFFF"
              fontSize="16px"
              fontWeight="700"
              lineHeight="1"
              whiteSpace="nowrap"
            >
              {brandIdentity.name} Admin
            </Text>
          </HStack>

          <Flex
            flex="1"
            align="center"
            justify="center"
            w="100%"
            px={{ base: 5, sm: 8 }}
            py={{ base: 10, sm: 16 }}
          >
            <Box
              as="form"
              noValidate
              onSubmit={handleSubmit}
              w="100%"
              maxW="448px"
            >
              <VStack spacing="16px" align="stretch">
                <Box mb="16px">
                  <Heading
                    as="h2"
                    color="#FFFFFF"
                    fontSize={{ base: "24px", sm: "30px" }}
                    fontWeight="700"
                    lineHeight="1.2"
                    letterSpacing="0"
                    mb="8px"
                  >
                    {brandIdentity.name} Admin Login
                  </Heading>
                  <Text color="#8A95A3" fontSize="14px">
                    Sign in with your Ship Aggregator admin credentials
                  </Text>
                </Box>

                <FormControl>
                  <InputGroup>
                    <InputLeftElement h="48px" w="40px" pointerEvents="none">
                      <Box
                        as={IconMail}
                        size={16}
                        color="#8A95A3"
                        strokeWidth={2}
                      />
                    </InputLeftElement>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@shipaggregator.com"
                      autoComplete="username"
                      required
                      h="48px"
                      pl="40px"
                      pr="12px"
                      borderRadius="12px"
                      bg="#0E131A"
                      border="2px solid"
                      borderColor="#29313B"
                      color="#FFFFFF"
                      fontSize="14px"
                      fontWeight="500"
                      _placeholder={{ color: "#65707D" }}
                      _hover={{ borderColor: "rgba(108,92,231,0.35)" }}
                      _focus={{
                        borderColor: "#6C5CE7",
                        boxShadow: "none",
                        bg: "#0E131A",
                      }}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <InputGroup>
                    <InputLeftElement h="48px" w="40px" pointerEvents="none">
                      <Box
                        as={IconLock}
                        size={16}
                        color="#8A95A3"
                        strokeWidth={2}
                      />
                    </InputLeftElement>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      autoComplete="current-password"
                      required
                      h="48px"
                      pl="40px"
                      pr="44px"
                      borderRadius="12px"
                      bg="#0E131A"
                      border="2px solid"
                      borderColor="#29313B"
                      color="#FFFFFF"
                      fontSize="14px"
                      fontWeight="500"
                      _placeholder={{ color: "#65707D" }}
                      _hover={{ borderColor: "rgba(108,92,231,0.35)" }}
                      _focus={{
                        borderColor: "#6C5CE7",
                        boxShadow: "none",
                        bg: "#0E131A",
                      }}
                    />
                    <InputRightElement h="48px" w="44px">
                      <IconButton
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        variant="ghost"
                        size="sm"
                        color="#8B94A1"
                        tabIndex={-1}
                        onClick={() => setShowPassword(!showPassword)}
                        _hover={{ bg: "transparent", color: "#FFFFFF" }}
                        _active={{ bg: "transparent" }}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  h="48px"
                  borderRadius="12px"
                  bg="linear-gradient(90deg, #6C5CE7 0%, #7C6CF2 100%)"
                  color="#FFFFFF"
                  fontSize="14px"
                  fontWeight="600"
                  isLoading={loading}
                  loadingText="Signing in"
                  boxShadow="0 12px 28px rgba(108, 92, 231, 0.2)"
                  _hover={{
                    bg: "linear-gradient(90deg, #7464EF 0%, #8878FF 100%)",
                    boxShadow: "0 16px 34px rgba(108, 92, 231, 0.35)",
                  }}
                  _active={{
                    bg: "linear-gradient(90deg, #6251DE 0%, #7E6BEA 100%)",
                  }}
                >
                  Sign in
                </Button>
              </VStack>
            </Box>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default SignIn;
