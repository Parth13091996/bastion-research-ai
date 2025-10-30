import { create } from "zustand";

// Global store for raw SheetData (you can change the type if you have a specific SheetData type)
type SheetStocksState = {
  rawSheetData: any[]; // replace 'any' with your actual SheetData type if necessary
  setRawSheetData: (data: any[]) => void;
};
export const useSheetStocksStore = create<SheetStocksState>((set) => ({
  rawSheetData: [],
  setRawSheetData: (data) => set({ rawSheetData: data }),
}));
