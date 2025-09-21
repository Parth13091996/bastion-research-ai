import React, { useEffect, useRef, useState } from "react";
import { Value } from "@udecode/plate-core";
import { getRootProps } from "@udecode/plate-styled-components";
import "./style.css";
import { Transforms } from "slate";
import { ReactEditor, useSlate } from "slate-react";

export const NameNodeElement = (props: any) => {
  const {
    attributes,
    children,
    nodeProps,
    element,
    scrollToContent = true
  } = props;

  const rootProps = getRootProps(props);

  const editor = useSlate() as any;

  const reverseNode = () => {
    const reverse = element.reverse;

    const path = ReactEditor.findPath(editor, element);

    Transforms.setNodes(
      editor,
      {
        reverse: !reverse
      } as any,
      {
        at: path
      }
    );
  };

  return (
    <div {...attributes} {...rootProps}>
      <button contentEditable={false} onClick={reverseNode}>
        Reverse
      </button>
      <div contentEditable={false} className="name-node ">
        <div className={element.reverse ? "reverse-scrolling" : "scrolling"}>
          Rohan Keskar
        </div>
      </div>
      {children}
    </div>
  );
};
