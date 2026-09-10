import { Button, FormControl, FormLabel, Input, Stack } from '@chakra-ui/react'
import { useCreatePlan, useUpdatePlan } from 'hooks/usePlans'
import { useEffect, useState } from 'react'

const PlanForm = ({ plan, onClose }) => {
  const createPlan = useCreatePlan()
  const updatePlan = useUpdatePlan()

  const [form, setForm] = useState({ name: '', description: '', commission_percentage: 0 })

  useEffect(() => {
    if (plan) {
      setForm({ name: plan.name, description: plan.description || '', commission_percentage: Number(plan.commission_percentage || 0) })
    } else {
      setForm({ name: '', description: '', commission_percentage: 0 })
    }
  }, [plan])

  const handleSubmit = () => {
    if (plan) {
      updatePlan.mutate({ id: plan.id, data: form }, { onSuccess: onClose })
    } else {
      createPlan.mutate(form, { onSuccess: onClose })
    }
  }

  return (
    <Stack spacing={4}>
      <FormControl>
        <FormLabel>Name</FormLabel>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </FormControl>
      <FormControl>
        <FormLabel>Description</FormLabel>
        <Input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Courier Cost Commission (%)</FormLabel>
        <Input
          type="number"
          min="0"
          max="70"
          step="0.01"
          value={form.commission_percentage}
          onChange={(e) => setForm({ ...form, commission_percentage: Math.min(70, Math.max(0, Number(e.target.value || 0))) })}
        />
      </FormControl>
      <Button colorScheme="blue" onClick={handleSubmit}>
        {plan ? 'Update Plan' : 'Create Plan'}
      </Button>
    </Stack>
  )
}

export default PlanForm
