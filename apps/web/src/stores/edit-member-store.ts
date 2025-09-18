import { create } from "zustand";

export type Member = {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  address_1?: string;
  address_2?: string | null;
  pan_card_number?: string;
  state?: string;
  city?: string;
  pin_code?: string;
  date_of_birth?: string; // ISO date string
  company_name?: string | null;
  role?: string;
  status?: string;
};

type EditMemberState = {
  isOpen: boolean;
  member: Member | null;
  open: (member: Member) => void;
  close: () => void;
  setMember: (member: Partial<Member>) => void;
};

export const useEditMemberStore = create<EditMemberState>((set) => ({
  isOpen: false,
  member: null,
  open: (member) => set({ isOpen: true, member }),
  close: () => set({ isOpen: false }),
  setMember: (partial) =>
    set((s) => ({ member: s.member ? { ...s.member, ...partial } : s.member })),
}));
