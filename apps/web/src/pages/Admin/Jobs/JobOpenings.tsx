import { ColDef } from "ag-grid-community";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";
import { Briefcase, Users, MapPin, Home, Trash2 } from "lucide-react";
import { useModalStore } from "@/stores/modal-store";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";

const JobOpenings = () => {
  const queryClient = useQueryClient();
  const { data: rowData, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: () =>
      axiosInstance.get(endpoints.jobs.base).then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) =>
      axiosInstance.delete(endpoints.jobs.byId(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job deleted successfully");
    },
  });

  // Simple cell renderers used by the grid
  const LocationRenderer = ({ value }: { value?: string }) => {
    const val = value || "—";
    const isOffice = (val || "").toLowerCase() === "office";
    const Icon = isOffice ? MapPin : Home;
    return (
      <div className="flex items-center">
        <Icon className="mr-1 h-4 w-4 text-muted-foreground" />
        <span>{val}</span>
      </div>
    );
  };

  const ExpiryRenderer = ({ value }: { value?: string }) => {
    if (!value) return <span>—</span>;
    const d = new Date(value);
    const isValid = !isNaN(d.getTime());
    return <span>{isValid ? d.toLocaleDateString() : "—"}</span>;
  };

  const columns: ColDef[] = [
    { 
      headerName: "Job Title", 
      field: "job_title",
      flex: 2,
      minWidth: 200,
      cellRenderer: (params: any) => (
        <div className="flex items-center">
          <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{params.value}</span>
        </div>
      ),
    },
    { 
      headerName: "Author", 
      field: "author",
      flex: 1,
      minWidth: 120,
    },
    { 
      headerName: "Team", 
      field: "team",
      flex: 1,
      minWidth: 120,
    },
    { 
      headerName: "Experience", 
      field: "experience",
      flex: 1,
      minWidth: 120,
    },
    { 
      headerName: "Type", 
      field: "job_type",
      flex: 1,
      minWidth: 120,
    },
    {
      headerName: "Location",
      field: "location",
      cellRenderer: (p: any) => <LocationRenderer value={p.value} />,
      flex: 1,
      minWidth: 150,
    },
    { 
      headerName: "Applications", 
      field: "applications",
      width: 100,
      cellRenderer: (params: any) => (
        <div className="flex items-center">
          <Users className="mr-1 h-3 w-3" />
          {params.value || 0}
        </div>
      ),
    },
    {
      headerName: "Expiry",
      field: "expiry",
      cellRenderer: (p: any) => <ExpiryRenderer value={p.value} />,
      flex: 1,
      minWidth: 120,
    },
    { 
      headerName: "Views", 
      field: "views",
      width: 80,
    },
  ];

  const bulkActions = [
    {
      label: "Delete Selected",
      icon: <Trash2 className="h-4 w-4" />,
      action: (selected: any[]) => handleBulkDelete(selected),
      variant: "destructive" as const,
    },
  ];

  const handleEdit = (row: any) => {
    // Navigate to edit job page or open edit modal
    console.log("Edit job:", row);
  };

  const handleDelete = (row: any) => {
    const setModalOpen = useModalStore.getState().set;
    const setModalProps = useModalStore.getState().setProps;
    
    setModalProps("confirm", {
      title: "Delete job opening?",
      description: `This will permanently delete "${row.job_title}".`,
      confirmText: "Delete",
      cancelText: "Cancel",
      tone: "danger",
      onConfirm: () => {
        deleteMutation.mutate(row.job_id);
        setModalOpen("confirm", false);
        setModalProps("confirm", undefined);
      },
      onCancel: () => {
        setModalProps("confirm", undefined);
      },
    });
    setModalOpen("confirm", true);
  };

  const handleBulkDelete = (selected: any[]) => {
    const setModalOpen = useModalStore.getState().set;
    const setModalProps = useModalStore.getState().setProps;
    
    setModalProps("confirm", {
      title: `Delete ${selected.length} job openings?`,
      description: "This action cannot be undone.",
      confirmText: "Delete All",
      cancelText: "Cancel",
      tone: "danger",
      onConfirm: async () => {
        try {
          await Promise.all(selected.map(job => 
            axiosInstance.delete(endpoints.jobs.byId(job.job_id))
          ));
          queryClient.invalidateQueries({ queryKey: ["jobs"] });
          toast.success(`${selected.length} jobs deleted successfully`);
        } catch (error) {
          toast.error("Failed to delete some jobs");
        } finally {
          setModalOpen("confirm", false);
          setModalProps("confirm", undefined);
        }
      },
      onCancel: () => {
        setModalProps("confirm", undefined);
      },
    });
    setModalOpen("confirm", true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Openings</h1>
          <p className="text-muted-foreground">
            Manage job postings and applications
          </p>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={rowData || []}
        columns={columns}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        bulkActions={bulkActions}
        searchPlaceholder="Search jobs by title, team, or location..."
        title="Job Openings"
        description={`${rowData?.length || 0} active job openings`}
      />
    </div>
  );
};

export default JobOpenings;
