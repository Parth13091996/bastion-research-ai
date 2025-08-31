"use client";

import * as React from 'react';
import type { Value } from 'platejs';
import {
  BlockquotePlugin,
  BoldPlugin,
  CodeBlockPlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  HighlightPlugin,
  HrPlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@platejs/basic-nodes/react';
import {
  Plate,
  usePlateEditor,
} from 'platejs/react';
import { BlockquoteElement } from '@/components/ui/blockquote-node';
import { CodeBlockElement } from '@/components/ui/code-block-node';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { FixedToolbar, ToolbarGroup } from '@/components/ui/fixed-toolbar';
import { H1Element, H2Element, H3Element } from '@/components/ui/heading-node';
import { HighlightElement } from '@/components/ui/highlight-node';
import { HrElement } from '@/components/ui/hr-node';
import { MarkToolbarButton } from '@/components/ui/mark-toolbar-button';
import { ToolbarButton } from '@/components/ui/toolbar';
import { LinkKit } from '@/components/editor/plugins/link-kit';
import { LinkToolbarButton } from '@/components/ui/link-toolbar-button';
import { MediaKit } from '@/components/editor/plugins/media-kit';
import { ImageToolbarButton } from '@/components/ui/ImageToolbarButton';
import { ListKit } from '@/components/editor/plugins/list-classic-kit';
import { ListToolbarButton } from '@/components/ui/list-classic-toolbar-button';
import { UndoToolbarButton, RedoToolbarButton } from '@/components/ui/history-toolbar-button';

const initialValue: Value = [
  {
    children: [{ text: 'Title' }],
    type: 'h3',
  },
  {
    children: [{ text: 'This is a quote.' }],
    type: 'blockquote',
  },
  {
    children: [
      { text: 'With some ' },
      { bold: true, text: 'bold' },
      { text: ' text for emphasis!' },
    ],
    type: 'p',
  },
];

export default function RichEditor() {
  const editor = usePlateEditor({
    // Note: Plate.js has built-in history management, so no separate HistoryPlugin is needed.
    plugins: [
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      StrikethroughPlugin,
      HighlightPlugin.withComponent(HighlightElement),
      H1Plugin.withComponent(H1Element),
      H2Plugin.withComponent(H2Element),
      H3Plugin.withComponent(H3Element),
      BlockquotePlugin.withComponent(BlockquoteElement),
      CodeBlockPlugin.withComponent(CodeBlockElement),
      HrPlugin.withComponent(HrElement),
      ...LinkKit,
      ...MediaKit,
      ...ListKit,
    ],
    value: (() => {
        const savedValue = localStorage.getItem('plate-content');
        return savedValue ? JSON.parse(savedValue) : initialValue;
    })(),
  });

  return (
    <Plate
      editor={editor}
      onChange={(value) => {
        localStorage.setItem('plate-content', JSON.stringify(value));
      }}
    >
      <FixedToolbar className="flex justify-start gap-1 rounded-t-lg">
        <ToolbarGroup>
          <UndoToolbarButton />
          <RedoToolbarButton />
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarButton onClick={() => editor.tf.toggle.h1()}>H1</ToolbarButton>
          <ToolbarButton onClick={() => editor.tf.toggle.h2()}>H2</ToolbarButton>
          <ToolbarButton onClick={() => editor.tf.toggle.h3()}>H3</ToolbarButton>
        </ToolbarGroup>
        <ToolbarGroup>
          <MarkToolbarButton nodeType="bold" tooltip="Bold (⌘+B)">B</MarkToolbarButton>
          <MarkToolbarButton nodeType="italic" tooltip="Italic (⌘+I)">I</MarkToolbarButton>
          <MarkToolbarButton nodeType="underline" tooltip="Underline (⌘+U)">U</MarkToolbarButton>
          <MarkToolbarButton nodeType="strikethrough" tooltip="Strikethrough">S</MarkToolbarButton>
          <MarkToolbarButton nodeType="highlight" tooltip="Highlight">H</MarkToolbarButton>
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarButton onClick={() => editor.tf.toggle.blockquote()}>Quote</ToolbarButton>
          <ToolbarButton onClick={() => editor.tf.toggle.code_block()}>Code</ToolbarButton>
          <ToolbarButton onClick={() => editor.tf.hr.insert()}>HR</ToolbarButton>
        </ToolbarGroup>
        <ToolbarGroup>
          <ListToolbarButton nodeType="ul" />
          <ListToolbarButton nodeType="ol" />
        </ToolbarGroup>
        <ToolbarGroup>
          <LinkToolbarButton />
          <ImageToolbarButton />
        </ToolbarGroup>
      </FixedToolbar>
      <EditorContainer>
        <Editor placeholder="Type your amazing content here..." />
      </EditorContainer>
    </Plate>
  );
}
