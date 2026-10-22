import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAccount } from "@/lib/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";

export function useAccount() {
  const fetchAccount = useServerFn(getAccount);
  return useQuery({
    queryKey: ["account"],
    queryFn: () => fetchAccount({ data: { environment: getStripeEnvironment() } }),
  });
}
