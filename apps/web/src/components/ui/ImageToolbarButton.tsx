"use client";

import React from 'react';
import { useEditor, insertImage } from 'platejs/react';
import { ToolbarButton } from './toolbar';
import { ImageIcon } from 'lucide-react';

export function ImageToolbarButton() {
  const editor = useEditor();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          insertImage(editor, dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = handleFileChange;
    input.click();
  };

  return (
    <ToolbarButton onClick={handleClick} tooltip="Insert Image">
      <ImageIcon />
    </ToolbarButton>
  );
}
