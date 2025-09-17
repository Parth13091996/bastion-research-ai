import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const Recommendation = () => {
  const { data: rowData, isLoading } = useQuery({
    queryKey: ['membership-plans'],
    queryFn: () => axiosInstance.get('/api/membership-plans').then((res) => res.data),
  });

  const columnDefs: ColDef[] = [
    { headerName: 'Plan ID', field: 'plan_id' },
    { headerName: 'Plan Name', field: 'plan_name' },
    { headerName: 'Plan Type', field: 'plan_type' },
    { headerName: 'Members', field: 'members' },
    { headerName: 'WP Role', field: 'wp_role' },
    { headerName: 'Price', field: 'price_amount' },
    { headerName: 'Currency', field: 'currency' },
    { headerName: 'Duration (Months)', field: 'duration_months' },
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // return (
  //   <div>
  //     <h1 className="text-2xl font-bold mb-4">Manage Plans</h1>
  //     <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
  //       <AgGridReact
  //         rowData={rowData}
  //         columnDefs={columnDefs}
  //         defaultColDef={{ sortable: true, filter: true, resizable: true }}
  //         pagination={true}
  //         paginationPageSize={10}
  //       />
  //     </div>
  //   </div>
  // );
};

export default Recommendation;
