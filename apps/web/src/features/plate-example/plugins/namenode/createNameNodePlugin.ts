import { createPluginFactory } from "@udecode/plate-core";
import { NameNodeElement } from "./components";

export const ELEMENT_NAME_NODE = "name";

/**
 * Enables support for Excalidraw drawing tool within a Slate document
 */
export const createNameNodePlugin = createPluginFactory({
  key: ELEMENT_NAME_NODE,
  component: NameNodeElement,
  isElement: true,
  isVoid: true
});
