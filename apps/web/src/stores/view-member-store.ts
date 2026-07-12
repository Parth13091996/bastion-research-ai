import { create } from "zustand";
import { Member } from "./edit-member-store";

type ViewMemberState = {
  isOpen: boolean;
  member: Member | null;
  open: (member: Member) => void;
  close: () => void;
};

export const useViewMemberStore = create<ViewMemberState>((set) => ({
  isOpen: false,
  member: null,
  open: (member) => set({ isOpen: true, member }),
  close: () => set({ isOpen: false }),
}));
