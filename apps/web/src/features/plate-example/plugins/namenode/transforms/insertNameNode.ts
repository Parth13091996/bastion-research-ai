import {
  getParentNode,
  insertNodes,
  PlateEditor,
  PlatePluginKey,
  TNodeProps,
  Value
} from "@udecode/plate-core";
import { ELEMENT_NAME_NODE } from "../createNameNodePlugin";

export const insertNameNode = <V extends Value>(
  editor: PlateEditor<V>,
  { key = ELEMENT_NAME_NODE, ...props }: any
): void => {
  if (!editor.selection) return;

  const selectionParentEntry = getParentNode(editor, editor.selection);
  if (!selectionParentEntry) return;

  const [, path] = selectionParentEntry;

  insertNodes(
    editor,
    {
      type: key,
      children: [{ text: "" }],
      ...props
    },
    { at: path }
  );
};
