import { alpha, Box, Button, Container, Stack, TextField, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import { useEffect, type ReactNode } from 'react'
import { FiArrowRight, FiClock, FiMail, FiUser } from 'react-icons/fi'
import PublicFooter from '../components/public/PublicFooter'
import PublicNavbar from '../components/public/PublicNavbar'

const ink = '#11182d'
const muted = '#64748b'
const border = '#e6ebf3'
const purple = '#7867f3'
const orange = '#ff6b16'
const navy = '#0b1028'
const navy2 = '#19154d'

const categories = ['All', 'Shipping Tips', 'E-commerce', 'Industry News', 'Product Updates', 'Guides']

const posts = [
  {
    title: '10 Proven Strategies to Reduce RTO and Save Lakhs on Shipping',
    excerpt: 'Return to origin is the silent profit killer in e-commerce. Learn data-backed techniques...',
    category: 'Shipping Tips',
    date: '9 Apr 2026',
    author: 'Arjun Patel',
    readTime: '1 min read',
    image: '/images/blog.png',
  },
]

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.42 },
}

function DottedSection({
  children,
  minHeight,
}: {
  children: ReactNode
  minHeight?: { xs: number; md: number }
}) {
  return (
    <Box
      sx={{
        color: '#fff',
        minHeight,
        backgroundColor: navy,
        backgroundImage: `
          radial-gradient(circle at 12px 12px, rgba(124, 92, 255, 0.35) 1px, transparent 1px),
          linear-gradient(120deg, ${navy} 0%, #101633 45%, ${navy2} 100%)
        `,
        backgroundSize: '35px 35px, auto',
      }}
    >
      {children}
    </Box>
  )
}

function BlogCard({ post }: { post: (typeof posts)[number] }) {
  return (
    <Box
      component={motion.article}
      {...fadeUp}
      sx={{
        maxWidth: 434,
        borderRadius: '18px',
        bgcolor: '#fff',
        border: `1px solid ${border}`,
        overflow: 'hidden',
      }}
    >
      <Box
        component="img"
        src={post.image}
        alt={post.title}
        sx={{
          width: '100%',
          height: 250,
          objectFit: 'cover',
          display: 'block',
          bgcolor: '#f8fafc',
        }}
      />
      <Stack spacing={1.8} sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography
            sx={{
              px: 1.4,
              py: 0.38,
              borderRadius: 999,
              bgcolor: alpha(purple, 0.1),
              color: purple,
              fontWeight: 800,
              fontSize: '0.82rem',
            }}
          >
            {post.category}
          </Typography>
          <Typography sx={{ color: muted, fontSize: '0.9rem', fontWeight: 600 }}>{post.date}</Typography>
        </Stack>
        <Typography component="h2" sx={{ color: ink, fontSize: '1.18rem', lineHeight: 1.25, fontWeight: 900 }}>
          {post.title}
        </Typography>
        <Typography sx={{ color: muted, lineHeight: 1.55 }}>{post.excerpt}</Typography>
        <Box sx={{ borderTop: `1px solid ${border}`, pt: 2, display: 'flex', alignItems: 'center', gap: 2.1, color: muted }}>
          <Stack direction="row" spacing={0.7} alignItems="center">
            <FiUser size={14} />
            <Typography sx={{ fontSize: '0.84rem', fontWeight: 650 }}>{post.author}</Typography>
          </Stack>
          <Stack direction="row" spacing={0.7} alignItems="center">
            <FiClock size={14} />
            <Typography sx={{ fontSize: '0.84rem', fontWeight: 650 }}>{post.readTime}</Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  )
}

export default function BlogsPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff', color: ink }}>
      <PublicNavbar solid />

      <Box
        component="main"
        sx={{
          pt: { xs: 16, md: 20 },
          pb: { xs: 9, md: 11 },
          backgroundImage: 'radial-gradient(circle at 12px 12px, rgba(120, 103, 243, 0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2.5, sm: 4, lg: 10 } }}>
          <Stack component={motion.section} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42 }} spacing={2.3} alignItems="center" textAlign="center">
            <Typography
              sx={{
                px: 1.8,
                py: 0.55,
                borderRadius: 999,
                bgcolor: alpha(purple, 0.1),
                color: purple,
                fontWeight: 900,
                fontSize: '0.84rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: purple }} />
              Blog
            </Typography>

            <Typography
              component="h1"
              sx={{
                color: ink,
                fontWeight: 900,
                lineHeight: 1.08,
                letterSpacing: 0,
                fontSize: { xs: '2.75rem', sm: '4rem', lg: '5rem' },
              }}
            >
              Shipping{' '}
              <Box component="span" sx={{ color: purple }}>
                Insights & Resources
              </Box>
            </Typography>
            <Typography sx={{ color: muted, maxWidth: 790, fontSize: { xs: '1.05rem', md: '1.35rem' }, lineHeight: 1.48 }}>
              Tips, guides, and industry news to help you ship smarter, reduce costs, and grow your e-commerce business.
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.2} useFlexGap flexWrap="wrap" sx={{ mt: { xs: 9, md: 14 }, mb: { xs: 5, md: 7 } }}>
            {categories.map((category, index) => (
              <Button
                key={category}
                type="button"
                variant={index === 0 ? 'contained' : 'outlined'}
                sx={{
                  minHeight: 46,
                  px: 2.4,
                  borderRadius: 999,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  bgcolor: index === 0 ? purple : '#fff',
                  color: index === 0 ? '#fff' : ink,
                  borderColor: border,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: index === 0 ? '#6657e5' : alpha(purple, 0.06),
                    borderColor: index === 0 ? purple : border,
                    boxShadow: 'none',
                  },
                }}
              >
                {category}
              </Button>
            ))}
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, pb: { xs: 8, md: 10 } }}>
            {posts.map((post) => (
              <BlogCard key={post.title} post={post} />
            ))}
          </Box>
        </Container>
      </Box>

      <DottedSection minHeight={{ xs: 520, md: 620 }}>
        <Container maxWidth="md" sx={{ px: { xs: 2.5, sm: 4 }, py: { xs: 9, md: 11 } }}>
          <Stack component={motion.section} {...fadeUp} spacing={2.5} alignItems="center" textAlign="center">
            <Typography component="h2" sx={{ color: '#fff', fontSize: { xs: '2.5rem', md: '3.7rem' }, lineHeight: 1.05, fontWeight: 900 }}>
              Stay ahead of the curve
            </Typography>
            <Typography sx={{ color: alpha('#fff', 0.62), fontSize: { xs: '1.05rem', md: '1.18rem' }, lineHeight: 1.6, maxWidth: 660 }}>
              Get the latest shipping tips, industry news, and product updates delivered to your inbox every week.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.4} sx={{ width: '100%', maxWidth: 560, pt: 2 }}>
              <TextField
                placeholder="Enter your email"
                fullWidth
                InputProps={{
                  startAdornment: <FiMail style={{ marginRight: 10, color: '#64748b' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    minHeight: 62,
                    borderRadius: '12px',
                    bgcolor: '#fff',
                    color: ink,
                    '& fieldset': { border: 'none' },
                  },
                  '& input': { fontSize: '1rem' },
                }}
              />
              <Button
                variant="contained"
                endIcon={<FiArrowRight />}
                sx={{
                  minHeight: 62,
                  px: 3.8,
                  borderRadius: '12px',
                  bgcolor: orange,
                  fontWeight: 900,
                  fontSize: '1rem',
                  boxShadow: '0 16px 34px rgba(249, 115, 22, 0.32)',
                  '&:hover': { bgcolor: '#ea580c' },
                }}
              >
                Subscribe
              </Button>
            </Stack>
            <Typography sx={{ color: alpha('#fff', 0.38), fontSize: '0.92rem' }}>
              No spam, unsubscribe anytime. We respect your inbox.
            </Typography>
          </Stack>
        </Container>
      </DottedSection>

      <PublicFooter />
    </Box>
  )
}
