import { atom } from "jotai";

export type ModalKey = "projectInfo";

export type ModalState = Record<ModalKey, boolean>;

const initialModalState: ModalState = {
  projectInfo: false,
};

export const modalStateAtom = atom<ModalState>(initialModalState);

export const setModalAtom = atom(
  null,
  (get, set, { key, value }: { key: ModalKey; value: boolean }) => {
    const current = get(modalStateAtom);
    if (current[key] === value) return;
    set(modalStateAtom, { ...current, [key]: value });
  }
);

export const toggleModalAtom = atom(null, (get, set, key: ModalKey) => {
  const current = get(modalStateAtom);
  set(modalStateAtom, { ...current, [key]: !current[key] });
});

export const resetModalsAtom = atom(null, (_get, set) => {
  set(modalStateAtom, initialModalState);
});
