import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const SiteProtector = () => {
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) return; // ADMIN = FULL ACCESS

    // Helper to check if event target is inside AG Grid
    const isGrid = (target: EventTarget | null) =>
      target instanceof Element && target.closest('.ag-root');

    const disableContextMenu = (e: Event) => {
      e.preventDefault();
    };

    const disableDrag = (e: Event) => e.preventDefault();

    const disableSelection = (e: Event) => {
      // Allow selection within AG Grid
      if (isGrid(e.target)) return;
      e.preventDefault();
    };

    const blockShortcuts = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const target = e.target as HTMLElement;


      const isGridInteract = isGrid(target);

      // Block Saving (Ctrl+S), Print (Ctrl+P), etc.
      if (e.ctrlKey && ["s", "p", "a"].includes(key)) {
        e.preventDefault();
        return;
      }

      // Copy/Cut/Paste
      if (e.ctrlKey && ["c", "x", "v"].includes(key)) {
        // Allow Copy in Grid
        if (key === 'c' && isGridInteract) return;

        e.preventDefault();
        return;
      }

      // Mac specific (Meta)
      if (e.metaKey && ["s", "p", "a", "c", "x", "v"].includes(key)) {
        if (key === 'c' && isGridInteract) return;
        e.preventDefault();
        return;
      }
    };

    // Apply global restrictions
    document.addEventListener("contextmenu", disableContextMenu);
    document.addEventListener("dragstart", disableDrag);
    document.addEventListener("selectstart", disableSelection);
    document.addEventListener("keydown", blockShortcuts);

    const style = document.createElement('style');
    style.innerHTML = `
      body {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      /* Allow selection in grid cells */
      .ag-cell, .ag-cell-value {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener("contextmenu", disableContextMenu);
      document.removeEventListener("dragstart", disableDrag);
      document.removeEventListener("selectstart", disableSelection);
      document.removeEventListener("keydown", blockShortcuts);
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [isAdmin]);

  return null;
};

export default SiteProtector;
