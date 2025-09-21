import { createPluginFactory, QueryNodeOptions } from "@udecode/plate-core";
import { withChangedNodeId } from "./withChangedNodeId";

export interface ChangedNodeIdPlugin extends QueryNodeOptions {}

export const KEY_CHANGED_NODE_ID = "changedNodeId";

/**
 * @see {@link withNodeId}
 */
export const createChangedNodeIdPlugin = createPluginFactory<
  ChangedNodeIdPlugin
>({
  key: KEY_CHANGED_NODE_ID,
  withOverrides: withChangedNodeId
});
