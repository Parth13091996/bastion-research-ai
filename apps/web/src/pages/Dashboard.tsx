import { useAuth } from '@/contexts/AuthContext';
import CashfreePayment from '@/components/CashfreePayment';
import PaymentHistory from '@/components/PaymentHistory';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Welcome, {user?.name || user?.email}</h1>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CashfreePayment />
        <PaymentHistory />
      </div>
    </div>
  );
};

export default Dashboard;
