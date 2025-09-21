const getCurrentNestedBlock = (editor: any) => {
  var selection: any = { ...editor.selection };

  var currentBlock: any = { ...editor };
  if (selection) {
    if (selection.anchor) {
      if (selection.anchor.path) {
        const anchorPath = [...selection.anchor.path];

        anchorPath.pop();

        while (anchorPath.length > 0) {
          currentBlock = currentBlock?.children[anchorPath[0]];
          anchorPath.shift();
        }

        if (anchorPath.length > 0) {
          currentBlock = currentBlock?.children[anchorPath[0]];
        }
      } else {
        currentBlock = currentBlock[selection.anchor];
      }
    } else if (selection.focus) {
      if (selection.focus.path) {
        const focusPath = [...selection.focus.path];

        focusPath.pop();

        while (focusPath.length > 0) {
          currentBlock = currentBlock?.children[focusPath[0]];
          focusPath.shift();
        }

        if (focusPath.length > 0) {
          currentBlock = currentBlock?.children[focusPath[0]];
        }
      } else {
        currentBlock = currentBlock[selection.focus];
      }
    }
  } else {
    selection = undefined;
  }

  return currentBlock;
};

export default getCurrentNestedBlock;
