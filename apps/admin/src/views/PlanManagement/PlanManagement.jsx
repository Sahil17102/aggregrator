import { AddIcon } from "@chakra-ui/icons";
import {
  HStack,
  IconButton,
  Switch,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import {
  IconCrown,
  IconEdit,
  IconLayersIntersect,
  IconTrash,
} from "@tabler/icons-react";
import {
  AdminStack,
  DataTable,
  Metric,
  PageIntro,
  PrimaryButton,
  SoftBadge,
} from "components/AdminUI/AdminPage";
import PlanModal from "components/plans/PlanModal";
import { useDeletePlan, usePlans, useUpdatePlan } from "hooks/usePlans";
import { useState } from "react";

const PlanManagement = () => {
  const { data: plans, isLoading } = usePlans();
  const deletePlan = useDeletePlan();
  const updatePlan = useUpdatePlan();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleCreate = () => {
    setSelectedPlan(null);
    onOpen();
  };

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    onOpen();
  };

  const handleDelete = (id) => {
    deletePlan.mutate(id);
  };
  const handleActivate = (plan) => {
    console.log("plan", plan);
    updatePlan.mutate({ id: plan.id, data: { is_active: plan?.is_active } });
  };

  return (
    <AdminStack>
      <PageIntro
        icon={IconCrown}
        title="Plan Management"
        subtitle="Create and manage pricing plans for users"
        right={
          <Metric
            icon={IconLayersIntersect}
            value={(plans || []).length}
            label="total plans"
            color="#6C5CE7"
          />
        }
      />

      <HStack justify="flex-end">
        <PrimaryButton leftIcon={<AddIcon />} onClick={handleCreate}>
          Add Plan
        </PrimaryButton>
      </HStack>

      <DataTable
        loading={isLoading}
        rows={plans || []}
        columns={[
          {
            key: "name",
            label: "Name",
            render: (value, row) => (
              <HStack spacing="10px">
                <Text fontWeight="600">{value}</Text>
                {row?.slug === "basic" || row?.is_default ? (
                  <SoftBadge colorScheme="blue">Default</SoftBadge>
                ) : null}
              </HStack>
            ),
          },
          {
            key: "slug",
            label: "Slug",
            render: (value) => (
              <SoftBadge colorScheme="gray">{value}</SoftBadge>
            ),
          },
          {
            key: "description",
            label: "Description",
            render: (value) => <Text color="#607397">{value || "—"}</Text>,
          },
          {
            key: "sort_order",
            label: "Sort Order",
            align: "center",
            render: (value) => value ?? 0,
          },
          {
            key: "is_active",
            label: "Status",
            align: "center",
            render: (value, row) => (
              <Switch
                colorScheme="purple"
                isChecked={Boolean(
                  value ?? row?.active ?? row?.status === "active"
                )}
                onChange={(event) =>
                  handleActivate({ ...row, is_active: event.target.checked })
                }
              />
            ),
          },
        ]}
        actions={(row) => (
          <HStack spacing="8px" justify="flex-end">
            <IconButton
              aria-label="Edit plan"
              icon={<IconEdit size={20} />}
              size="sm"
              variant="ghost"
              color="#607397"
              onClick={() => handleEdit(row)}
            />
            {row?.slug !== "basic" && !row?.is_default ? (
              <IconButton
                aria-label="Delete plan"
                icon={<IconTrash size={20} />}
                size="sm"
                variant="ghost"
                color="#607397"
                onClick={() => handleDelete(row.id)}
              />
            ) : null}
          </HStack>
        )}
        minW="980px"
      />

      <PlanModal isOpen={isOpen} onClose={onClose} plan={selectedPlan} />
    </AdminStack>
  );
};

export default PlanManagement;
