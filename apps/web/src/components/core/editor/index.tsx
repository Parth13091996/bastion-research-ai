import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, { useEffect } from 'react';

interface TiptapEditorProps {
  initialValue: string;
  onChange: (content: string) => void;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({ initialValue, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialValue,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor) {
      const { from, to } = editor.state.selection;
      editor.commands.setContent(initialValue, false);
      editor.commands.setTextSelection({ from, to });
    }
  }, [initialValue, editor]);

  return <EditorContent editor={editor} />;
};

export default TiptapEditor;
