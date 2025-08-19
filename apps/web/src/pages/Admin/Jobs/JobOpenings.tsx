import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const JobOpenings = () => {
  const { data: rowData, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => axiosInstance.get('/api/jobs').then((res) => res.data),
  });

  const columnDefs: ColDef[] = [
    { headerName: 'Job ID', field: 'job_id' },
    { headerName: 'Job Title', field: 'job_title' },
    { headerName: 'Author', field: 'author' },
    { headerName: 'Applications', field: 'applications' },
    { headerName: 'Expiry', field: 'expiry' },
    { headerName: 'Views', field: 'views' },
    { headerName: 'Conversion', field: 'conversion' },
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Job Openings</h1>
      <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
        />
      </div>
    </div>
  );
};

export default JobOpenings;
