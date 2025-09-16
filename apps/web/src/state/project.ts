import { atom } from "jotai";

export type ProjectAmount = { code: string; symbol: string; value: number };
export type ProjectInfo = { project_amount: ProjectAmount; reference_number: string };

const initialProjectInfo: ProjectInfo = {
  project_amount: { code: "USD", symbol: "$", value: 0 },
  reference_number: "",
};

export const projectInfoAtom = atom<ProjectInfo>(initialProjectInfo);

export const setProjectInfoAtom = atom(null, (_get, set, info: ProjectInfo) => {
  set(projectInfoAtom, info);
});

export const resetProjectInfoAtom = atom(null, (_get, set) => {
  set(projectInfoAtom, initialProjectInfo);
});
