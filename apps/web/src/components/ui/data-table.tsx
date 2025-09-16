import * as React from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridReadyEvent, SelectionChangedEvent } from "ag-grid-community";
import { Button } from "./button";
import { Input } from "./input";
import { Badge } from "./badge";
import { Checkbox } from "./checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import {
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  Eye,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableProps<T = any> {
  data: T[];
  columns: ColDef<T>[];
  loading?: boolean;
  error?: string;
  onSelectionChange?: (selectedRows: T[]) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  bulkActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    action: (selectedRows: T[]) => void;
    variant?: "default" | "destructive";
  }>;
  searchPlaceholder?: string;
  title?: string;
  description?: string;
  enableExport?: boolean;
  className?: string;
}

const StatusRenderer = ({ value }: { value: string }) => {
  const getStatusVariant = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "active" || s === "success" || s === "completed") return "default";
    if (s === "pending" || s === "processing") return "secondary";
    if (s === "failed" || s === "error" || s === "cancelled") return "destructive";
    return "secondary";
  };

  return (
    <Badge variant={getStatusVariant(value)} className="capitalize">
      {value || "Unknown"}
    </Badge>
  );
};

const ActionsRenderer = ({ data, context }: { data: any; context: any }) => {
  const { onEdit, onDelete, onView } = context;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onView && (
          <DropdownMenuItem onClick={() => onView(data)}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(data)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(data)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export function DataTable<T = any>({
  data,
  columns,
  loading = false,
  error,
  onSelectionChange,
  onEdit,
  onDelete,
  onView,
  bulkActions = [],
  searchPlaceholder = "Search...",
  title,
  description,
  enableExport = true,
  className,
}: DataTableProps<T>) {
  const gridRef = React.useRef<AgGridReact>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedRows, setSelectedRows] = React.useState<T[]>([]);
  const [quickFilterText, setQuickFilterText] = React.useState("");

  // Enhanced column definitions with actions
  const enhancedColumns = React.useMemo(() => {
    const cols = [...columns];
    
    // Add actions column if any action handlers are provided
    if (onEdit || onDelete || onView) {
      cols.push({
        headerName: "Actions",
        field: "actions",
        cellRenderer: ActionsRenderer,
        sortable: false,
        filter: false,
        width: 80,
        pinned: "right",
      });
    }

    // Enhance status columns with custom renderer
    return cols.map((col) => {
      if (col.field === "status" || col.field === "transaction_status") {
        return {
          ...col,
          cellRenderer: StatusRenderer,
        };
      }
      return col;
    });
  }, [columns, onEdit, onDelete, onView]);

  const defaultColDef = React.useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 120,
  }), []);

  const onGridReady = React.useCallback((params: GridReadyEvent) => {
    // Auto-size columns to fit content
    params.api.sizeColumnsToFit();
  }, []);

  const onSelectionChanged = React.useCallback((event: SelectionChangedEvent) => {
    const selected = event.api.getSelectedRows();
    setSelectedRows(selected);
    onSelectionChange?.(selected);
  }, [onSelectionChange]);

  React.useEffect(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.setGridOption("quickFilterText", quickFilterText);
    }
  }, [quickFilterText]);

  const handleExport = React.useCallback(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `${title?.toLowerCase().replace(/\s+/g, '-') || 'data'}-export.csv`,
      });
    }
  }, [title]);

  const context = React.useMemo(() => ({
    onEdit,
    onDelete,
    onView,
  }), [onEdit, onDelete, onView]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      {(title || description) && (
        <div>
          {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={quickFilterText}
              onChange={(e) => setQuickFilterText(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>

          {/* Bulk Actions */}
          {bulkActions.length > 0 && selectedRows.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Bulk Actions ({selectedRows.length})
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {bulkActions.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => action.action(selectedRows)}
                    className={cn(
                      action.variant === "destructive" &&
                        "text-red-600 focus:text-red-600"
                    )}
                  >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Export */}
        {enableExport && (
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-muted-foreground">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 font-medium">Error loading data</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        ) : (
          <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
            <AgGridReact
              ref={gridRef}
              rowData={data}
              columnDefs={enhancedColumns}
              defaultColDef={defaultColDef}
              rowSelection={{
                mode: "multiRow",
                checkboxes: true,
                headerCheckbox: true,
                enableClickSelection: false,
              }}
              pagination={true}
              paginationPageSize={20}
              paginationPageSizeSelector={[10, 20, 50, 100]}
              onGridReady={onGridReady}
              onSelectionChanged={onSelectionChanged}
              suppressCellFocus={true}
              context={context}
              animateRows={true}
              enableRangeSelection={true}
              suppressRowClickSelection={true}
              theme="legacy"
            />
          </div>
        )}
      </div>

      {/* Footer Info */}
      {!loading && !error && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {data.length} {data.length === 1 ? "row" : "rows"}
            {selectedRows.length > 0 && (
              <span className="ml-2">
                ({selectedRows.length} selected)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}