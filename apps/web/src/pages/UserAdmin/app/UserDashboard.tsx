import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const CouponManagement = () => {
  const { data: rowData, isLoading } = useQuery({
    queryKey: ["coupons"],
    queryFn: () => axiosInstance.get("/api/coupons").then((res) => res.data),
  });

  const columnDefs: ColDef[] = [
    { headerName: "Coupon ID", field: "coupon_id" },
    { headerName: "Coupon Code", field: "coupon_code" },
    { headerName: "Discount Type", field: "discount_type" },
    { headerName: "Discount Value", field: "discount_value" },
    { headerName: "Expiry Date", field: "expiry_date" },
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Coupon Management</h1>
      <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
        <AgGridReact rowData={rowData} columnDefs={columnDefs} />
      </div>
    </div>
  );
};

export default CouponManagement;
