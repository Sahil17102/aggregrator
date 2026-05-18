import { Container } from '@mui/material'
import TermsAndConditionsText from './TermsAndConditionsText'

const TermsOfService = () => {
  return (
    <Container maxWidth="lg">
      <TermsAndConditionsText scrollable={false} />
    </Container>
  )
}

export default TermsOfService
