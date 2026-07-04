import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
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
} from '@chakra-ui/react'
import {
  IconChartBar,
  IconLock,
  IconMail,
  IconSettings,
  IconShieldLock,
  IconUsers,
} from '@tabler/icons-react'
import { motion } from 'framer-motion'
import { jwtDecode } from 'jwt-decode'
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { loginAdmin } from '../../services/auth.service'
import { useAuthStore } from '../../store/useAuthStore'
import { brandIdentity } from '../../theme/brand'

function isTokenValid(token) {
  try {
    const decoded = jwtDecode(token)
    return decoded.exp > Date.now() / 1000
  } catch {
    return false
  }
}

function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const history = useHistory()
  const login = useAuthStore((state) => state.login)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      toast({
        title: 'Enter email and password',
        description: 'Use your admin credentials to continue.',
        status: 'warning',
        duration: 2500,
        isClosable: true,
      })
      return
    }

    setLoading(true)

    try {
      const data = await loginAdmin(email, password)

      login(data.token, data?.user?.id, data.refreshToken)

      toast({
        title: 'Login successful',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })

      history.push('/admin/dashboard')
    } catch (err) {
      const status = err?.response?.status

      toast({
        title: status === 401 ? 'Invalid email or password' : 'Unable to sign in',
        description:
          status === 401 ? 'Please use a valid admin account.' : 'Please try again in a moment.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')

    if (accessToken && refreshToken && isTokenValid(refreshToken)) {
      history.replace('/admin/dashboard')
    }
  }, [history])

  const featureCards = [
    {
      title: 'Secure Access',
      description: 'Role-based access control for admin operations',
      icon: IconShieldLock,
    },
    {
      title: 'User Management',
      description: 'Manage users, plans and permissions',
      icon: IconUsers,
    },
    {
      title: 'Analytics',
      description: 'Real-time insights and reporting dashboard',
      icon: IconChartBar,
    },
    {
      title: 'System Control',
      description: 'Configure couriers, rates and serviceability',
      icon: IconSettings,
    },
  ]

  return (
    <Flex
      minH="100vh"
      bg="#171C23"
      align="stretch"
      justify="stretch"
      position="relative"
      overflow="hidden"
      fontFamily="'Plus Jakarta Sans', sans-serif"
    >
      <Flex
        as={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        w="100%"
        direction={{ base: 'column', lg: 'row' }}
      >
        <Flex
          w={{ base: '100%', lg: '42%' }}
          minH={{ base: 'auto', lg: '100vh' }}
          bg="#070C12"
          color="white"
          direction="column"
          justify="center"
          position="relative"
          px={{ base: 6, md: 10, xl: '70px' }}
          py={{ base: 10, lg: 0 }}
        >
          <Box maxW="666px">
            <HStack spacing="22px" mb={{ base: 12, lg: '88px' }} align="center">
              <Box
                as="img"
                src={brandIdentity.logoPath}
                alt={brandIdentity.name}
                h={{ base: '62px', lg: '82px' }}
                w={{ base: '62px', lg: '82px' }}
                objectFit="contain"
              />
              <Text
                color="#FFFFFF"
                fontSize={{ base: '2xl', lg: '30px' }}
                fontWeight="800"
                letterSpacing="0"
                lineHeight="1"
              >
                Admin Panel
              </Text>
            </HStack>

            <Box mb={{ base: 8, lg: '46px' }}>
              <Heading
                as="h1"
                color="#FFFFFF"
                fontSize={{ base: '38px', md: '48px', xl: '46px' }}
                fontWeight="800"
                lineHeight="1.08"
                letterSpacing="0"
                mb="18px"
              >
                Admin
                <Text as="span" display="block" color="#FF7A1A">
                  Control Panel
                </Text>
              </Heading>
              <Text
                color="#9BA6B5"
                fontSize={{ base: '16px', md: '18px' }}
                lineHeight="1.55"
                maxW="470px"
                fontWeight="500"
              >
                Manage your courier aggregation platform — users, couriers, rates,
                serviceability, and more.
              </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} maxW="666px">
              {featureCards.map((card) => {
                const FeatureIcon = card.icon
                return (
                  <Box
                    key={card.title}
                    minH="178px"
                    bg="#1D2229"
                    border="1px solid"
                    borderColor="#303741"
                    borderRadius="18px"
                    px="20px"
                    py="28px"
                    boxShadow="inset 0 1px 0 rgba(255,255,255,0.02)"
                  >
                    <Box as={FeatureIcon} size={24} color="#FF7A1A" strokeWidth={2.1} mb="28px" />
                    <Text color="#FFFFFF" fontSize="18px" fontWeight="800" lineHeight="1.2" mb="6px">
                      {card.title}
                    </Text>
                    <Text color="#8D929A" fontSize="15px" lineHeight="1.55" fontWeight="600">
                      {card.description}
                    </Text>
                  </Box>
                )
              })}
            </SimpleGrid>
          </Box>
        </Flex>

        <Flex
          flex="1"
          minH={{ base: 'auto', lg: '100vh' }}
          bg="#171C23"
          align="center"
          justify="center"
          px={{ base: 6, md: 10 }}
          py={{ base: 12, lg: 0 }}
        >
          <Box as="form" noValidate onSubmit={handleSubmit} w="100%" maxW="560px">
            <VStack spacing="20px" align="stretch">
              <Box mb="20px">
                <Heading
                  as="h2"
                  color="#FFFFFF"
                  fontSize={{ base: '34px', md: '40px' }}
                  fontWeight="800"
                  lineHeight="1.1"
                  letterSpacing="0"
                  mb="10px"
                >
                  Admin Login
                </Heading>
                <Text color="#9BA6B5" fontSize="17px" fontWeight="500">
                  Sign in with your admin credentials
                </Text>
              </Box>

              <FormControl>
                <InputGroup>
                  <InputLeftElement h="58px" pl="18px" pointerEvents="none">
                    <Box as={IconMail} size={21} color="#7B68EE" strokeWidth={2} />
                  </InputLeftElement>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@shipaggregator.com"
                    h="58px"
                    pl="52px"
                    pr="18px"
                    borderRadius="18px"
                    bg="#171C23"
                    border="2px solid"
                    borderColor="#6C5CE7"
                    color="#FFFFFF"
                    fontSize="16px"
                    fontWeight="500"
                    _placeholder={{ color: '#7F8895' }}
                    _hover={{ borderColor: '#7D6CFF' }}
                    _focus={{
                      borderColor: '#7D6CFF',
                      boxShadow: '0 0 0 1px #7D6CFF',
                      bg: '#171C23',
                    }}
                  />
                </InputGroup>
              </FormControl>

              <FormControl>
                <InputGroup>
                  <InputLeftElement h="58px" pl="18px" pointerEvents="none">
                    <Box as={IconLock} size={21} color="#828B98" strokeWidth={2} />
                  </InputLeftElement>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    h="58px"
                    pl="52px"
                    pr="58px"
                    borderRadius="18px"
                    bg="#0C1117"
                    border="2px solid"
                    borderColor="#2A3038"
                    color="#FFFFFF"
                    fontSize="16px"
                    fontWeight="500"
                    _placeholder={{ color: '#737B86' }}
                    _hover={{ borderColor: '#3A414B' }}
                    _focus={{
                      borderColor: '#6C5CE7',
                      boxShadow: '0 0 0 1px #6C5CE7',
                      bg: '#0C1117',
                    }}
                  />
                  <InputRightElement h="58px" pr="10px">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      variant="ghost"
                      size="sm"
                      color="#8B94A1"
                      onClick={() => setShowPassword(!showPassword)}
                      _hover={{ bg: 'transparent', color: '#B8C0CC' }}
                      _active={{ bg: 'transparent' }}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Button
                type="submit"
                h="60px"
                mt="2px"
                borderRadius="18px"
                bg="linear-gradient(90deg, #6C5CE7 0%, #8976F2 100%)"
                color="#FFFFFF"
                fontSize="16px"
                fontWeight="800"
                isLoading={loading}
                loadingText="Signing in"
                _hover={{
                  bg: 'linear-gradient(90deg, #7464EF 0%, #9584FF 100%)',
                  boxShadow: '0 18px 36px rgba(108, 92, 231, 0.26)',
                }}
                _active={{ bg: 'linear-gradient(90deg, #6251DE 0%, #7E6BEA 100%)' }}
              >
                Sign in
              </Button>
            </VStack>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default SignIn
