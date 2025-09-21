import getCurrentNestedBlock from "../../utils/getCurrentNestedBlock";
import { Node, Transforms } from "slate";
import { ReactEditor } from "slate-react";

export const withChangedNodeId = (editor: any) => {
  const { apply } = editor;

  const updateOperations = [
    "insert_text",
    "remove_text",
    "split_node",
    "merge_node",
    "set_node"
  ];

  editor.apply = (operation: any) => {
    const operationType = operation.type;

    const node = getCurrentNestedBlock(editor);

    apply(operation);

    if (updateOperations.includes(operationType)) {
      setTimeout(() => {
        if (node) {
          // Remove the comment before sharing
          console.log("Updated node: ", node.id, Node.string(node));
        }
      }, 2000);
    }
  };

  return editor;
};
