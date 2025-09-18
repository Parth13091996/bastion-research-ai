import { create } from "zustand";

export type ModalKey = "projectInfo" | "addMember" | "confirm";

type ModalState = {
  modals: Record<ModalKey, boolean>;
  props: Partial<Record<ModalKey, any>>;
  open: (key: ModalKey) => void;
  close: (key: ModalKey) => void;
  toggle: (key: ModalKey) => void;
  set: (key: ModalKey, open: boolean) => void;
  setProps: (key: ModalKey, props: any | undefined) => void;
  clearProps: (key: ModalKey) => void;
};

export const useModalStore = create<ModalState>((set) => ({
  modals: {
    projectInfo: false,
    addMember: false,
    confirm: false,
  },
  props: {},
  open: (key) => set((s) => ({ modals: { ...s.modals, [key]: true } })),
  close: (key) => set((s) => ({ modals: { ...s.modals, [key]: false } })),
  toggle: (key) =>
    set((s) => ({ modals: { ...s.modals, [key]: !s.modals[key] } })),
  set: (key, open) => set((s) => ({ modals: { ...s.modals, [key]: open } })),
  setProps: (key, props) =>
    set((s) => ({
      props:
        props === undefined
          ? Object.fromEntries(
              Object.entries(s.props).filter(([k]) => k !== key)
            )
          : {
              ...s.props,
              [key]: { ...(s.props[key as ModalKey] || {}), ...props },
            },
    })),
  clearProps: (key) =>
    set((s) => ({
      props: Object.fromEntries(
        Object.entries(s.props).filter(([k]) => k !== key)
      ),
    })),
}));
