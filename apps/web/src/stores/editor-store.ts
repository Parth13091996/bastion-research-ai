import { create } from "zustand";

type EditorState = {
  editor: any;
  setEditor: any;
};

export const useEditorStore = create<EditorState>((set) => ({
  editor: {},
  setEditor: (info) => set({ editor: info }),
}));
