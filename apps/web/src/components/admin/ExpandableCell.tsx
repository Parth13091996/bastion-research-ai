import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import { useState } from "react";

interface ExpandableCellProps {
  value: string;
  limit?: number;
  title?: string;
}

const ExpandableCell = ({
  value,
  limit = 100,
  title = "Details"
}: ExpandableCellProps) => {
  const [open, setOpen] = useState(false);
  const strValue = String(value || "");

  if (!strValue) return null;

  const truncated =
    strValue.length > limit ? `${strValue.slice(0, limit)}...` : strValue;
  const isTruncated = strValue.length > limit;

  return (
    <div className="group relative flex items-center justify-between w-full h-full">
      <span className="truncate pr-6 block" title={strValue}>
        {truncated}
      </span>
      {isTruncated && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-900"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(true);
              }}
            >
              <Eye size={16} />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">
              {strValue}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ExpandableCell;
