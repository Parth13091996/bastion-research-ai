import { create } from "zustand";

export type ModalKey = "projectInfo" | "addMember";

type ModalState = {
  modals: Record<ModalKey, boolean>;
  open: (key: ModalKey) => void;
  close: (key: ModalKey) => void;
  toggle: (key: ModalKey) => void;
  set: (key: ModalKey, open: boolean) => void;
};

export const useModalStore = create<ModalState>((set) => ({
  modals: {
    projectInfo: false,
    addMember: false,
  },
  open: (key) => set((s) => ({ modals: { ...s.modals, [key]: true } })),
  close: (key) => set((s) => ({ modals: { ...s.modals, [key]: false } })),
  toggle: (key) =>
    set((s) => ({ modals: { ...s.modals, [key]: !s.modals[key] } })),
  set: (key, open) => set((s) => ({ modals: { ...s.modals, [key]: open } })),
}));
