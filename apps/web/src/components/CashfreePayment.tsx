import { useMutation, useQuery } from "@tanstack/react-query";
import { load } from "@cashfreepayments/cashfree-js";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/api/axios";
import { useAuth } from "@/contexts/AuthContext";

interface OrderResponse {
  payment_link: string;
}

const CashfreePayment = () => {
  const { user } = useAuth();
  const { data: plansData } = useQuery({
    queryKey: ["cashfree-plans"],
    queryFn: () =>
      axiosInstance
        .get("/api/cashfree/plans")
        .then((res) => res.data?.plans || []),
  });

  let cashfree;
  const mutation = useMutation<OrderResponse, Error, void>({
    mutationFn: () => {
      const plans: any[] = plansData || [];
      const firstPaid =
        plans.find((p: any) => (p?.amount || 0) > 0) || plans[0];
      if (!firstPaid) throw new Error("No plans available");
      return axiosInstance
        .post("/api/cashfree/orders", {
          plan: firstPaid.code, // now dynamic (plan_id as string)
          customer_id: user?.id,
          customer_email: user?.email,
          customer_phone: "9876543210", // This should be dynamic
        })
        .then((res) => res.data);
    },
    onSuccess: async (data: any) => {
      var initializeSDK = async function () {
        cashfree = await load({
          mode: "sandbox",
        });
      };
      await initializeSDK();
      let checkoutOptions = {
        paymentSessionId: data.order.payment_session_id,
        redirectTarget: "_self",
      };
      cashfree.checkout(checkoutOptions);
    },
  });

  const handlePayment = () => {
    mutation.mutate();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Create Payment</h2>
      <Button onClick={handlePayment} disabled={mutation.isPending}>
        {mutation.isPending ? "Processing..." : "Pay with Cashfree"}
      </Button>
      {mutation.isError && (
        <p className="mt-2 text-sm text-red-600">{mutation.error.message}</p>
      )}
    </div>
  );
};

export default CashfreePayment;
