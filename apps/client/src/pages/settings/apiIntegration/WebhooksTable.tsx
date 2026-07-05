import { Chip, IconButton, Stack, Switch, Typography } from '@mui/material'
import { MdDelete, MdEdit, MdRefresh } from 'react-icons/md'
import type { WebhookSubscription } from '../../../api/apiIntegration'
import DataTable, { type Column } from '../../../components/UI/table/DataTable'

interface WebhooksTableProps {
  webhooks: WebhookSubscription[]
  isLoading: boolean
  onEdit: (webhook: WebhookSubscription) => void
  onUpdate: (id: string, data: { is_active?: boolean }) => void
  onDelete: (id: string) => void
  onRegenerateSecret: (id: string) => void
}

export const WebhooksTable = ({
  webhooks,
  isLoading,
  onEdit,
  onUpdate,
  onDelete,
  onRegenerateSecret,
}: WebhooksTableProps) => {
  const columns: Column<WebhookSubscription>[] = [
    {
      id: 'name' as keyof WebhookSubscription,
      label: 'Name',
      minWidth: 150,
      render: (value) => value || 'Unnamed',
    },
    {
      id: 'url' as keyof WebhookSubscription,
      label: 'URL',
      minWidth: 300,
      render: (value) => (
        <Typography
          variant="body2"
          sx={{
            maxWidth: 300,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {value}
        </Typography>
      ),
    },
    {
      id: 'events' as keyof WebhookSubscription,
      label: 'Events',
      align: 'center',
      minWidth: 100,
      render: (value) => `${Array.isArray(value) ? value.length : 0} events`,
    },
    {
      id: 'is_active' as keyof WebhookSubscription,
      label: 'Status',
      align: 'center',
      minWidth: 100,
      render: (value, row) => (
        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
          <Switch
            checked={Boolean(value)}
            onChange={(event) => onUpdate(row.id, { is_active: event.target.checked })}
            size="small"
          />
          <Chip
            label={value ? 'Active' : 'Inactive'}
            color={value ? 'success' : 'default'}
            size="small"
          />
        </Stack>
      ),
    },
    {
      id: 'successful_deliveries' as keyof WebhookSubscription,
      label: 'Stats',
      minWidth: 150,
      render: (_, row) => (
        <Typography variant="caption">
          Success: {row.successful_deliveries || 0} | Failed: {row.failed_deliveries || 0}
        </Typography>
      ),
    },
    {
      id: 'id' as keyof WebhookSubscription,
      label: 'Actions',
      align: 'center',
      minWidth: 120,
      render: (_, row) => (
        <Stack direction="row" spacing={1} justifyContent="center">
          <IconButton
            size="small"
            onClick={() => onRegenerateSecret(row.id)}
            title="Regenerate Secret"
            sx={{ color: '#333369' }}
          >
            <MdRefresh size={18} />
          </IconButton>
          <IconButton size="small" onClick={() => onEdit(row)} title="Edit">
            <MdEdit size={18} />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => onDelete(row.id)} title="Delete">
            <MdDelete size={18} />
          </IconButton>
        </Stack>
      ),
    },
  ]

  if (isLoading) {
    return <Typography>Loading...</Typography>
  }

  return (
    <DataTable
      rows={webhooks}
      columns={columns}
      maxHeight={600}
      pagination={false}
    />
  )
}

