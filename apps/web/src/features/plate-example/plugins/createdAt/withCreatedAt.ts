import {
  defaultsDeepToNodes,
  PlateEditor,
  queryNode,
  someNode,
  TNode,
  TNodeEntry,
  Value,
  WithPlatePlugin
} from "@udecode/plate-core";
import cloneDeep from "lodash/cloneDeep";
import { Transforms } from "slate";
import getCurrentNestedBlock from "../../utils/getCurrentNestedBlock";
import { CreatedAtPlugin } from "./createCreatedAtPlugin";

/**
 * Enables support for inserting nodes with an id key.
 */
export const withCreatedAt = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  {
    options: {
      idKey = "",
      userId = "",
      createdAtCreator,
      filterText,
      filter,
      reuseId,
      allow,
      exclude
    }
  }: WithPlatePlugin<CreatedAtPlugin, V, E>
) => {
  const { apply } = editor;

  const createdAt = () => ({ [idKey]: createdAtCreator!() });

  const updateTypes = ["insert_text", "remove_text"];

  const filterNode = (nodeEntry: TNodeEntry) => {
    return (
      filter!(nodeEntry) && (!filterText || nodeEntry[0]?.type !== undefined)
    );
  };

  const query = {
    filter: filterNode,
    allow,
    exclude
  };

  editor.apply = (operation) => {
    if (updateTypes.includes(operation.type)) {
      apply(operation);

      const time = Date.now();
      const path = operation.path[0];
      const updateOperation = {
        type: "set_node",
        path: [path],
        properties: {
          updated: time,
          modifiedByUserId: editor.id
        },
        newProperties: {
          updated: time,
          modifiedByUserId: editor.id
        }
      };

      apply(updateOperation as any);
      return;
    }

    if (operation.type === "insert_node") {
      // clone to be able to write (read-only)
      const node = cloneDeep(operation.node);

      // the id in the new node is already being used in the editor, we need to replace it with a new id
      if (
        !reuseId ||
        someNode(editor, { match: { [idKey]: node[idKey] }, at: [] })
      ) {
        delete node[idKey];
      }

      defaultsDeepToNodes({
        node,
        source: createdAt,
        query
      });

      return apply({
        ...operation,
        node: {
          ...node,
          updated: Date.now(),
          createdByUserId: editor.id
        }
      });
    }

    if (operation.type === "split_node") {
      const node = operation.properties as TNode;

      // only for elements (node with a type) or all nodes if `filterText=false`
      if (queryNode([node, []], query)) {
        let createdAt = operation.properties[idKey];

        /**
         * Create a new id if:
         * - the id in the new node is already being used in the editor or,
         * - the node has no id
         */
        if (
          !reuseId ||
          createdAt === undefined ||
          someNode(editor, {
            match: { [idKey]: createdAt },
            at: []
          })
        ) {
          createdAt = createdAtCreator!();
        }

        return apply({
          ...operation,
          properties: {
            ...operation.properties,
            [idKey]: createdAt,
            updated: Date.now(),
            createdByUserId: editor.id
          }
        });
      }
    }

    return apply(operation);
  };

  return editor;
};
