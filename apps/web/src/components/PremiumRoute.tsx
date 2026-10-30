import { Navigate, Outlet } from 'react-router-dom';
import { useSubscription } from '@/hooks/use-subscription';
export default function PremiumRoute() {
  const { data, isPending, isError } = useSubscription();
  if (isPending)
    return (
      <p role="status" className="p-6">
        Checking subscription…
      </p>
    );
  if (isError)
    return (
      <p role="alert" className="p-6">
        Unable to verify premium access. Please refresh and try again.
      </p>
    );
  return data?.is_premium ? <Outlet /> : <Navigate to="/user/app/account/subscription" replace />;
}
