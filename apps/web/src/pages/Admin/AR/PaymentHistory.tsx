import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const PaymentHistory = () => {
  const { data: rowData, isLoading } = useQuery({
    queryKey: ['payment-history'],
    queryFn: () => axiosInstance.get('/api/payment-history').then((res) => res.data),
  });

  const columnDefs: ColDef[] = [
    { headerName: 'Transaction ID', field: 'transaction_id' },
    { headerName: 'Invoice ID', field: 'invoice_id' },
    { headerName: 'User ID', field: 'user_id' },
    { headerName: 'User Email', field: 'user_email' },
    { headerName: 'Membership', field: 'membership' },
    { headerName: 'Payment Gateway', field: 'payment_gateway' },
    { headerName: 'Payment Type', field: 'payment_type' },
    { headerName: 'Payer Email', field: 'payer_email' },
    { headerName: 'Status', field: 'transaction_status' },
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Payment History</h1>
      <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
        />
      </div>
    </div>
  );
};

export default PaymentHistory;
