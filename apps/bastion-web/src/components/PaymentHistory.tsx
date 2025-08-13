import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import { PaymentTransaction } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const PaymentHistory = () => {
  const { data, isLoading, isError, error } = useQuery<
    PaymentTransaction[],
    Error
  >({
    queryKey: ['paymentHistory'],
    queryFn: () =>
      axiosInstance.get('/api/cashfree/orders').then((res) => res.data),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Payment History</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.id}</TableCell>
              <TableCell>{transaction.amount}</TableCell>
              <TableCell>{transaction.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PaymentHistory;
