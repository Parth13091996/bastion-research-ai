import 'tippy.js/dist/tippy.css';
import '@/features/plate-example/index.css';
import { useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { createJuicePlugin } from '@udecode/plate-juice';
import {
  Plate,
  createAlignPlugin,
  createAutoformatPlugin,
  createBlockquotePlugin,
  createBoldPlugin,
  createCodeBlockPlugin,
  createCodePlugin,
  createComboboxPlugin,
  createDeserializeCsvPlugin,
  createDeserializeDocxPlugin,
  createDeserializeMdPlugin,
  createDndPlugin,
  createExitBreakPlugin,
  createHeadingPlugin,
  createHighlightPlugin,
  createHorizontalRulePlugin,
  createImagePlugin,
  createIndentPlugin,
  createItalicPlugin,
  createKbdPlugin,
  createLinkPlugin,
  createListPlugin,
  createMediaEmbedPlugin,
  createNodeIdPlugin,
  createNormalizeTypesPlugin,
  createParagraphPlugin,
  createResetNodePlugin,
  createSelectOnBackspacePlugin,
  createSoftBreakPlugin,
  createStrikethroughPlugin,
  createSubscriptPlugin,
  createSuperscriptPlugin,
  createTablePlugin,
  createTodoListPlugin,
  createTrailingBlockPlugin,
  createUnderlinePlugin,
  HeadingToolbar,
  MentionCombobox,
  usePlateEditorRef,
} from '@udecode/plate';
import {
  MarkBallonToolbar,
  ToolbarButtons,
} from '@/features/plate-example/config/components/Toolbars';
import { withStyledPlaceHolders } from '@/features/plate-example/config/components/withStyledPlaceHolders';
import { withStyledDraggables } from '@/features/plate-example/config/components/withStyledDraggables';
import { CONFIG } from '@/features/plate-example/config/config';
import { createDragOverCursorPlugin } from '@/features/plate-example/config/plugins';
import { CursorOverlayContainer } from '@/features/plate-example/config/components/CursorOverlayContainer';
import {
  createMyPlugins,
  MyEditor,
  MyPlatePlugin,
  MyValue,
} from '@/features/plate-example/config/typescript';
import { createChangedNodeIdPlugin } from '@/features/plate-example/plugins/changedNodeId';
// Removed custom NameNode plugin to simplify deps
import { createMentionPlugin } from '@/features/plate-example/plugins/mentionPlugin';
import { createCreatedAtPlugin } from '@/features/plate-example/plugins/createdAt';
import transformEditorPayload from '@/features/plate-example/utils/transformEditorPayload';

// Build components map
import { createPlateUI, ELEMENT_CODE_BLOCK, StyledElement } from '@udecode/plate';

const componentsBase = createPlateUI({
  [ELEMENT_CODE_BLOCK]: StyledElement,
});
const components = withStyledDraggables(withStyledPlaceHolders(componentsBase));

const USER_ID = '14f1f8b0-3373-4397-9016-27bafa6b03f7';

export default function Editor() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mentionables, setMentionables] = useState<any[]>([]);

  const plugins = createMyPlugins(
    [
      createParagraphPlugin(),
      createBlockquotePlugin(),
      createTodoListPlugin(),
      createHeadingPlugin(),
      createImagePlugin(),
      createHorizontalRulePlugin(),
      createLinkPlugin(),
      createListPlugin(),
      createTablePlugin(),
      createMediaEmbedPlugin(),
      createCodeBlockPlugin(),
      createAlignPlugin(CONFIG.align),
      createBoldPlugin(),
      createCodePlugin(),
      createItalicPlugin(),
      createHighlightPlugin(),
      createUnderlinePlugin(),
      createStrikethroughPlugin(),
      createSubscriptPlugin(),
      createSuperscriptPlugin(),
      createJuicePlugin() as MyPlatePlugin,
      createNodeIdPlugin(),
      createDndPlugin(),
      createDragOverCursorPlugin(),
      createIndentPlugin(CONFIG.indent),
      createAutoformatPlugin(CONFIG.autoformat),
      createResetNodePlugin(CONFIG.resetBlockType),
      createSoftBreakPlugin(CONFIG.softBreak),
      createExitBreakPlugin(CONFIG.exitBreak),
      createNormalizeTypesPlugin(CONFIG.forceLayout),
      createTrailingBlockPlugin(CONFIG.trailingBlock),
      createSelectOnBackspacePlugin(CONFIG.selectOnBackspace),
      createComboboxPlugin(),
      createMentionPlugin(),
      createDeserializeMdPlugin(),
      createDeserializeCsvPlugin(),
      createDeserializeDocxPlugin(),
      createChangedNodeIdPlugin(),
      createCreatedAtPlugin(),
    ],
    { components }
  );

  const handleChange = (value: any) => {
    const transformedPayload = transformEditorPayload(value);
    // eslint-disable-next-line no-console
    console.log('Transformed value: ', transformedPayload);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const key = e.key;
    if (key === '@') {
      setMentionables(CONFIG.mentionItems);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate id={USER_ID} editableProps={CONFIG.editableProps} plugins={plugins} onChange={handleChange}>
        <HeadingToolbar>
          <ToolbarButtons />
        </HeadingToolbar>
        <div ref={containerRef} style={{ position: 'relative' }} onKeyDown={handleKeyDown}>
          <MarkBallonToolbar />
          <MentionCombobox items={mentionables} />
          {/* <CursorOverlayContainer containerRef={containerRef} /> */}
        </div>
      </Plate>
    </DndProvider>
  );
}
