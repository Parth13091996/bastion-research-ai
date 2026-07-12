import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type WebinarDateFieldProps = {
  id?: string;
  label: string;
  /** Stored as `yyyy-MM-dd` or empty */
  value: string;
  onChange: (isoDate: string) => void;
};

export function WebinarDateField({
  id,
  label,
  value,
  onChange,
}: WebinarDateFieldProps) {
  const date =
    value && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())
      ? new Date(value.trim() + "T12:00:00")
      : undefined
  const valid = date && !Number.isNaN(date.getTime()) ? date : undefined

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !valid && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {valid ? format(valid, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={valid}
            onSelect={(d) => onChange(d ? format(d, "yyyy-MM-dd") : "")}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
