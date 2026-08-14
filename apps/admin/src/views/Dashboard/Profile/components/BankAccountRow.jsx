import {
  Button,
  Flex,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import ReasonSelect from 'components/ReasonSelect'
import { useState } from 'react'
import { bankRejectionReasons } from 'utils/constants'

function BankAccountRow({ account, onUpdateStatus }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [rejectionReason, setRejectionReason] = useState('')
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    setLoading(true)
    try {
      await onUpdateStatus(account.id, 'verified')
    } catch {
      toast({ title: 'Failed to approve', status: 'error', duration: 3000, isClosable: true })
    }
    setLoading(false)
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({ title: 'Please enter a reason', status: 'warning', duration: 3000, isClosable: true })
      return
    }
    setLoading(true)
    try {
      await onUpdateStatus(account.id, 'rejected', rejectionReason)
      toast({ title: 'Rejected', status: 'success', duration: 3000, isClosable: true })
      setRejectionReason('')
      onClose()
    } catch {
      toast({ title: 'Failed to reject', status: 'error', duration: 3000, isClosable: true })
    }
    setLoading(false)
  }
  return (
    <Flex align="center" gap={4}>
      {/* Your account info display here */}

      <Button colorScheme="green" size="sm" onClick={handleApprove} isLoading={loading}>
        Approve
      </Button>

      <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose} placement="bottom">
        <PopoverTrigger>
          <Button colorScheme="red" size="sm" onClick={onOpen} isLoading={loading}>
            Reject
          </Button>
        </PopoverTrigger>
        <PopoverContent p={4}>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader fontWeight="bold">Rejection Reason</PopoverHeader>
          <PopoverBody>
            <ReasonSelect
              options={bankRejectionReasons}
              value={rejectionReason}
              onChange={setRejectionReason}
              placeholder="Select bank rejection reason"
              customPlaceholder="Enter a custom bank rejection reason"
              multiline
            />
          </PopoverBody>
          <PopoverFooter display="flex" justifyContent="flex-end" gap={2}>
            <Button size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" size="sm" onClick={handleReject} isLoading={loading}>
              Submit
            </Button>
          </PopoverFooter>
        </PopoverContent>
      </Popover>
    </Flex>
  )
}

export default BankAccountRow
