import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  SimpleGrid,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { IconCalculator } from "@tabler/icons-react";
import {
  AdminCard,
  AdminStack,
  DataTable,
  PageIntro,
} from "components/AdminUI/AdminPage";
import { useAvailableCouriersMutation } from "hooks/useCouriers";
import { useMemo, useState } from "react";
import { getCourierDisplayName } from "utils/courierDisplay";

const initialForm = {
  pickupPincode: "",
  deliveryPincode: "",
  weight: "",
  length: "",
  width: "",
  height: "",
  paymentType: "prepaid",
};

export default function RateCalculatorPage() {
  const toast = useToast();
  const { mutateAsync, isPending } = useAvailableCouriersMutation();
  const [mode, setMode] = useState("b2c");
  const [form, setForm] = useState(initialForm);
  const [rates, setRates] = useState([]);

  const canCalculate = useMemo(
    () =>
      form.pickupPincode.length === 6 &&
      form.deliveryPincode.length === 6 &&
      Number(form.weight) > 0,
    [form.deliveryPincode, form.pickupPincode, form.weight]
  );

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const reset = () => {
    setForm(initialForm);
    setRates([]);
  };

  const calculate = async () => {
    if (!canCalculate) return;
    try {
      const result = await mutateAsync({
        ...form,
        shipmentType: mode,
        orderAmount: 0,
        cod: form.paymentType === "cod" ? 1 : 0,
        context: "rate_calculator",
      });
      setRates(result || []);
    } catch (error) {
      toast({
        status: "error",
        title: "Unable to calculate rates",
        description:
          error?.response?.data?.message || "Please check the entered details.",
      });
    }
  };

  return (
    <AdminStack>
      <PageIntro
        icon={IconCalculator}
        title="Rate Calculator"
        subtitle="Calculate shipping rates across all available couriers for any route"
      />

      <HStack spacing="0">
        {["b2c", "b2b"].map((item) => (
          <Button
            key={item}
            h="38px"
            minW="65px"
            bg={mode === item ? "#FFFFFF" : "#F1F1F3"}
            color={mode === item ? "#333" : "#6B7280"}
            boxShadow={mode === item ? "0 1px 5px rgba(15,23,42,0.12)" : "none"}
            borderRadius="8px"
            onClick={() => setMode(item)}
          >
            {item.toUpperCase()}
          </Button>
        ))}
      </HStack>

      <AdminCard p="25px">
        <Stack spacing="20px">
          <SimpleGrid columns={{ base: 1, lg: 4 }} spacing="20px">
            <FormControl>
              <FormLabel
                textTransform="none"
                letterSpacing="0"
                color="#41557A"
                fontSize="15px"
                mb="7px"
              >
                Origin Pincode
              </FormLabel>
              <Input
                h="41px"
                value={form.pickupPincode}
                onChange={(event) =>
                  update("pickupPincode", event.target.value)
                }
                placeholder="e.g. 110001"
              />
            </FormControl>
            <FormControl>
              <FormLabel
                textTransform="none"
                letterSpacing="0"
                color="#41557A"
                fontSize="15px"
                mb="7px"
              >
                Destination Pincode
              </FormLabel>
              <Input
                h="41px"
                value={form.deliveryPincode}
                onChange={(event) =>
                  update("deliveryPincode", event.target.value)
                }
                placeholder="e.g. 400001"
              />
            </FormControl>
            <FormControl>
              <FormLabel
                textTransform="none"
                letterSpacing="0"
                color="#41557A"
                fontSize="15px"
                mb="7px"
              >
                Weight (grams)
              </FormLabel>
              <Input
                h="41px"
                value={form.weight}
                onChange={(event) => update("weight", event.target.value)}
                placeholder="e.g. 500"
              />
            </FormControl>
            <FormControl>
              <FormLabel
                textTransform="none"
                letterSpacing="0"
                color="#41557A"
                fontSize="15px"
                mb="7px"
              >
                Dimensions (L x B x H cm)
              </FormLabel>
              <HStack>
                <Input
                  h="41px"
                  placeholder="L"
                  value={form.length}
                  onChange={(event) => update("length", event.target.value)}
                />
                <Input
                  h="41px"
                  placeholder="B"
                  value={form.width}
                  onChange={(event) => update("width", event.target.value)}
                />
                <Input
                  h="41px"
                  placeholder="H"
                  value={form.height}
                  onChange={(event) => update("height", event.target.value)}
                />
              </HStack>
            </FormControl>
          </SimpleGrid>

          <Box maxW="363px">
            <Text color="#41557A" fontSize="15px" mb="8px">
              Payment Type
            </Text>
            <HStack spacing="0" bg="#F1F1F3" borderRadius="9px" p="3px">
              {[
                ["prepaid", "Prepaid"],
                ["cod", "COD"],
              ].map(([value, label]) => (
                <Button
                  key={value}
                  flex="1"
                  h="34px"
                  bg={form.paymentType === value ? "#FFFFFF" : "transparent"}
                  boxShadow={
                    form.paymentType === value
                      ? "0 1px 5px rgba(15,23,42,0.12)"
                      : "none"
                  }
                  onClick={() => update("paymentType", value)}
                >
                  {label}
                </Button>
              ))}
            </HStack>
          </Box>

          <HStack spacing="14px">
            <Button
              h="50px"
              px="20px"
              colorScheme="gray"
              isDisabled={!canCalculate}
              isLoading={isPending}
              onClick={calculate}
            >
              Calculate Rates
            </Button>
            <Button h="50px" px="20px" variant="outline" onClick={reset}>
              Reset
            </Button>
          </HStack>
        </Stack>
      </AdminCard>

      {rates.length ? (
        <DataTable
          rows={rates.map((rate, index) => ({ ...rate, sno: index + 1 }))}
          columns={[
            { key: "sno", label: "#", w: "80px" },
            {
              key: "name",
              label: "Courier",
              render: (_value, row) => getCourierDisplayName(row, "Courier"),
            },
            {
              key: "rate",
              label: "Rate",
              render: (value, row) =>
                `₹${Number(value || row.total || 0).toFixed(2)}`,
            },
            { key: "edd", label: "EDD", render: (value) => value || "—" },
          ]}
        />
      ) : null}
    </AdminStack>
  );
}
