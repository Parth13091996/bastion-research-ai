import {
  createBasicElementsPlugin,
  createBlockquotePlugin,
  createBoldPlugin,
  createCodeBlockPlugin,
  createCodePlugin,
  createHeadingPlugin,
  createImagePlugin,
  createItalicPlugin,
  createParagraphPlugin,
  createSelectOnBackspacePlugin,
  createStrikethroughPlugin,
  createUnderlinePlugin,
  findEventRange,
} from '@udecode/plate'
import { create } from 'zustand'
import { CONFIG } from './config'
import { MyPlatePlugin } from './typescript'

const basicElements = [
  createParagraphPlugin(), // paragraph element
  createBlockquotePlugin(), // blockquote element
  createCodeBlockPlugin(), // code block element
  createHeadingPlugin(), // heading elements
]

const basicMarks = [
  createBoldPlugin(), // bold mark
  createItalicPlugin(), // italic mark
  createUnderlinePlugin(), // underline mark
  createStrikethroughPlugin(), // strikethrough mark
  createCodePlugin(), // code mark
]

export const PLUGINS = {
  basicElements,
  basicMarks,
  basicNodes: [...basicElements, ...basicMarks],
  image: [
    createBasicElementsPlugin(),
    ...basicMarks,
    createImagePlugin(),
    createSelectOnBackspacePlugin(CONFIG.selectOnBackspace),
  ],
}

interface CursorState {
  cursors: Record<string, any>;
  setCursors: (cursors: Record<string, any>) => void;
}

export const cursorStore = create<CursorState>((set) => ({
  cursors: {},
  setCursors: (cursors) => set({ cursors }),
}))

export const createDragOverCursorPlugin = (): MyPlatePlugin => ({
  key: 'drag-over-cursor',
  handlers: {
    onDragOver: (editor) => (event) => {
      if (editor.isDragging) return

      const range = findEventRange(editor, event)
      if (!range) return

      cursorStore.getState().setCursors({
        drag: {
          key: 'drag',
          data: {
            style: {
              backgroundColor: '#fc00ff',
              backgroundImage: 'linear-gradient(0deg, #fc00ff, #00dbde)',
              width: 3,
            },
          },
          selection: range,
        },
      })
    },
    onDragLeave: () => () => {
      cursorStore.getState().setCursors({})
    },
    onDragEnd: () => () => {
      cursorStore.getState().setCursors({})
    },
    onDrop: () => () => {
      cursorStore.getState().setCursors({})
    },
  },
})
