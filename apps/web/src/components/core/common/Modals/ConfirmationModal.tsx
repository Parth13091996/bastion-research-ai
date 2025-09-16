import * as Dialog from "@radix-ui/react-dialog";
import { useModalStore } from "@/stores/modal-store";

type ConfirmModalProps = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  tone?: "danger" | "primary";
  isLoading?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
};

const ConfirmationModal = () => {
  const isOpen = useModalStore((s) => s.modals.confirm);
  const close = useModalStore((s) => s.close);
  const props = (useModalStore((s) => s.props.confirm) ||
    {}) as ConfirmModalProps;

  const {
    title = "Are you sure?",
    description = "This action cannot be undone.",
    confirmText = "Confirm",
    cancelText = "Cancel",
    tone = "primary",
    isLoading = false,
    onConfirm,
    onCancel,
  } = props;

  const confirmBtnClass =
    tone === "danger"
      ? "px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
      : "px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60";

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(o) => {
        if (!o) {
          onCancel?.();
          close("confirm");
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold text-gray-900">
            {title}
          </Dialog.Title>
          {description && (
            <Dialog.Description className="mt-2 text-sm text-gray-600">
              {description}
            </Dialog.Description>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <button
              className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => {
                onCancel?.();
                close("confirm");
              }}
              disabled={isLoading}
            >
              {cancelText}
            </button>
            <button
              className={confirmBtnClass}
              onClick={() => {
                onConfirm?.();
              }}
              disabled={isLoading}
            >
              {isLoading ? `${confirmText}...` : confirmText}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ConfirmationModal;
