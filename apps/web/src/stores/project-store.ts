import { create } from "zustand";

export type ProjectAmount = { code: string; symbol: string; value: number };
export type ProjectInfo = { project_amount: ProjectAmount; reference_number: string };

type ProjectState = {
  projectInfo: ProjectInfo | null;
  setProjectInfo: (info: ProjectInfo) => void;
};

export const useProjectStore = create<ProjectState>((set) => ({
  projectInfo: {
    project_amount: { code: "USD", symbol: "$", value: 0 },
    reference_number: "",
  },
  setProjectInfo: (info) => set({ projectInfo: info }),
}));

