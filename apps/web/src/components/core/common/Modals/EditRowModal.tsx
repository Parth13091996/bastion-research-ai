import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";

type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "email" | "tel" | "date" | "select";
  options?: string[];
  placeholder?: string;
};

interface EditRowModalProps {
  open: boolean;
  title: string;
  fields: Field[];
  initialValues: Record<string, any> | null;
  onClose: () => void;
  onSave: (values: Record<string, any>) => void;
  saving?: boolean;
}

const EditRowModal = ({
  open,
  title,
  fields,
  initialValues,
  onClose,
  onSave,
  saving,
}: EditRowModalProps) => {
  const [values, setValues] = useState<Record<string, any>>({});

  useEffect(() => {
    setValues(initialValues || {});
  }, [initialValues]);

  if (!initialValues) return null;

  const handleChange = (name: string, value: any) => {
    setValues((v) => ({ ...v, [name]: value }));
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[99]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[92vw] max-w-2xl max-h-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg overflow-y-auto z-[99999]">
          <Dialog.Title className="text-lg font-semibold text-gray-900">
            {title}
          </Dialog.Title>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.name} className="space-y-1">
                <label className="text-sm text-gray-700">{f.label}</label>
                {f.type === "select" ? (
                  <select
                    value={values[f.name] ?? ""}
                    onChange={(e) => handleChange(f.name, e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    {f.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    type={f.type || "text"}
                    placeholder={f.placeholder}
                    value={values[f.name] ?? ""}
                    onChange={(e) =>
                      handleChange(
                        f.name,
                        f.type === "number"
                          ? Number(e.target.value)
                          : e.target.value
                      )
                    }
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => onSave(values)} disabled={!!saving}>
              {"Save"}
            </Button>
          </div>
          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default EditRowModal;
