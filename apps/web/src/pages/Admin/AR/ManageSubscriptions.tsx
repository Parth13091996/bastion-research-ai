import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const ManageSubscriptions = () => {
  const { data: rowData, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => axiosInstance.get('/api/subscriptions').then((res) => res.data),
  });

  const columnDefs: ColDef[] = [
    { headerName: 'Membership ID', field: 'membership_id' },
    { headerName: 'Username', field: 'username' },
    { headerName: 'Name', field: 'name' },
    { headerName: 'Start Date', field: 'start_date' },
    { headerName: 'Next Renewal', field: 'expire_next_renewal' },
    { headerName: 'Amount', field: 'amount' },
    { headerName: 'Currency', field: 'currency' },
    { headerName: 'Payment Type', field: 'payment_type' },
    { headerName: 'Transaction ID', field: 'transaction_id' },
    { headerName: 'Status', field: 'status' },
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Subscriptions</h1>
      <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
        />
      </div>
    </div>
  );
};

export default ManageSubscriptions;
