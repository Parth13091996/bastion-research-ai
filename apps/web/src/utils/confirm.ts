import { useModalStore } from "@/stores/modal-store";

export type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  tone?: "danger" | "primary";
};

// Programmatic confirmation dialog using the shared ConfirmationModal.
export function confirm(options: ConfirmOptions = {}): Promise<boolean> {
  return new Promise((resolve) => {
    const store = useModalStore.getState();
    const close = () => {
      store.set("confirm", false);
      store.setProps("confirm", undefined);
    };
    store.setProps("confirm", {
      title: options.title ?? "Are you sure?",
      description: options.description ?? "This action cannot be undone.",
      confirmText: options.confirmText ?? "Confirm",
      cancelText: options.cancelText ?? "Cancel",
      tone: options.tone ?? "danger",
      onConfirm: () => {
        resolve(true);
        close();
      },
      onCancel: () => {
        resolve(false);
        close();
      },
    });
    store.set("confirm", true);
  });
}

export async function confirmDelete(label?: string) {
  const title = "Delete item?";
  const description = label
    ? `This will permanently delete "${label}".`
    : "This action cannot be undone.";
  return confirm({ title, description, confirmText: "Delete", tone: "danger" });
}

