import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const Applications = () => {
  const { data: rowData, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => axiosInstance.get('/api/applications').then((res) => res.data),
  });

  const columnDefs: ColDef[] = [
    { headerName: 'ID', field: 'application_id' },
    { headerName: 'Job ID', field: 'job_id' },
    { headerName: 'Applicant Name', field: 'applicant_name' },
    { headerName: 'Date Applied', field: 'date_applied' },
    { headerName: 'Status', field: 'status' },
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Applications</h1>
      <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
        />
      </div>
    </div>
  );
};

export default Applications;
