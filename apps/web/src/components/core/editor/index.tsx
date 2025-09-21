import * as React from 'react';
import { KEYS, type Value } from 'platejs';
import {
  BlockquotePlugin,
  BoldPlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  HighlightPlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
  HorizontalRulePlugin,
} from '@platejs/basic-nodes/react';
import { CodeBlockPlugin } from '@platejs/code-block/react';
import { Plate, usePlateEditor } from 'platejs/react';
import { ParagraphPlugin } from 'platejs/react';
import { BlockquoteElement } from '@/components/ui/blockquote-node';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { FixedToolbar } from '@/components/ui/fixed-toolbar';
import { H1Element, H2Element, H3Element } from '@/components/ui/heading-node';
import { HighlightLeaf } from '@/components/ui/highlight-node';
import { HrElement } from '@/components/ui/hr-node';
import { ParagraphElement } from '@/components/ui/paragraph-node';
import { MarkToolbarButton } from '@/components/ui/mark-toolbar-button';
import { ToolbarButton, ToolbarGroup } from '@/components/ui/toolbar';
import { LinkKit } from '@/components/editor/plugins/link-kit';
import { LinkToolbarButton } from '@/components/ui/link-toolbar-button';
import { MediaKit } from '@/components/editor/plugins/media-kit';
import { ImageToolbarButton } from '@/components/ui/ImageToolbarButton';
import { ListKit } from '@/components/editor/plugins/list-classic-kit';
import { ListToolbarButton } from '@/components/ui/list-classic-toolbar-button';
import {
  UndoToolbarButton,
  RedoToolbarButton,
} from '@/components/ui/history-toolbar-button';
import { TooltipProvider } from '@/components/ui/tooltip';

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
      ParagraphPlugin.withComponent(ParagraphElement),
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      StrikethroughPlugin,
      HighlightPlugin.configure({ node: { component: HighlightLeaf } }),
      H1Plugin.withComponent(H1Element),
      H2Plugin.withComponent(H2Element),
      H3Plugin.withComponent(H3Element),
      BlockquotePlugin.withComponent(BlockquoteElement),
      CodeBlockPlugin,
      HorizontalRulePlugin.withComponent(HrElement),
      ...LinkKit,
      ...MediaKit,
      ...ListKit,
    ],
    value: (() => {
      try {
        const saved = localStorage.getItem('plate-content');
        if (!saved) return initialValue;
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
        if (parsed?.editor?.children && Array.isArray(parsed.editor.children)) {
          return parsed.editor.children as Value;
        }
      } catch {}
      return initialValue;
    })(),
  });

  return (
    <Plate
      editor={editor}
      onChange={(state: any) => {
        const children = editor?.children ?? state?.editor?.children ?? null;
        if (children) {
          try {
            localStorage.setItem('plate-content', JSON.stringify(children));
          } catch {}
        }
      }}
    >
      <TooltipProvider delayDuration={150} skipDelayDuration={0}>
      <FixedToolbar className="flex justify-start gap-1 rounded-t-lg">
        <ToolbarGroup>
          <UndoToolbarButton />
          <RedoToolbarButton />
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarButton onClick={() => editor?.tf.toggle.h1()}>
            H1
          </ToolbarButton>
          <ToolbarButton onClick={() => editor?.tf.toggle.h2()}>
            H2
          </ToolbarButton>
          <ToolbarButton onClick={() => editor?.tf.toggle.h3()}>
            H3
          </ToolbarButton>
        </ToolbarGroup>
        <ToolbarGroup>
          <MarkToolbarButton nodeType="bold" tooltip="Bold (⌘+B)">B</MarkToolbarButton>
          <MarkToolbarButton nodeType="italic" tooltip="Italic (⌘+I)">I</MarkToolbarButton>
          <MarkToolbarButton nodeType="underline" tooltip="Underline (⌘+U)">U</MarkToolbarButton>
          <MarkToolbarButton nodeType="strikethrough" tooltip="Strikethrough">S</MarkToolbarButton>
          <MarkToolbarButton nodeType="highlight" tooltip="Highlight">H</MarkToolbarButton>
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarButton onClick={() => editor?.tf.toggle.blockquote()}>
            Quote
          </ToolbarButton>
          <ToolbarButton onClick={() => editor?.tf.toggle.codeBlock()}>
            Code
          </ToolbarButton>
          <ToolbarButton onClick={() => editor?.tf.hr.insert()}>
            HR
          </ToolbarButton>
        </ToolbarGroup>
        <ToolbarGroup>
          <ListToolbarButton />
          <ListToolbarButton nodeType={KEYS.olClassic} />
        </ToolbarGroup>
        <ToolbarGroup>
          <LinkToolbarButton />
          <ImageToolbarButton />
        </ToolbarGroup>
      </FixedToolbar>
      </TooltipProvider>
      <EditorContainer>
        <Editor placeholder="Type your amazing content here..." />
      </EditorContainer>
    </Plate>
  );
}
