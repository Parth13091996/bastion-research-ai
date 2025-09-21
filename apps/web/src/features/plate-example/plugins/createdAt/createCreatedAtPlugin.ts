import { createPluginFactory, QueryNodeOptions } from "@udecode/plate-core";
import { withCreatedAt } from "./withCreatedAt";

export interface CreatedAtPlugin extends QueryNodeOptions {
  /**
   * Node key to store the created.
   * @default 'created'
   */
  idKey?: string;
  userId?: string;
  /**
   * ID factory, e.g. `uuid`
   * @default () => Date.now()
   */
  createdAtCreator?: Function;
  /**
   * Filter `Text` nodes.
   * @default true
   */
  filterText?: boolean;
  /**
   * Reuse ids on undo/redo and copy/pasting if not existing in the document.
   * This is disabled by default to avoid duplicate ids across documents.
   * @default false
   */
  reuseId?: boolean;
}

export const KEY_NODE_ID = "createdAt";

/**
 * @see {@link withCreatedAt}
 */
export const createCreatedAtPlugin = createPluginFactory({
  key: KEY_NODE_ID,
  withOverrides: withCreatedAt,
  options: {
    idKey: "created",
    createdAtCreator: () => Date.now(),
    filterText: true,
    filter: () => true
  }
});
