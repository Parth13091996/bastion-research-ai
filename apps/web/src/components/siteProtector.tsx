// import { useEffect } from "react";

// const SiteProtector = () => {
//   useEffect(() => {
//     const disableContextMenu = (e) => e.preventDefault();
//     document.addEventListener("contextmenu", disableContextMenu);

//     const blockShortcuts = (e) => {
//       if (
//         (e.ctrlKey &&
//           ["c", "v", "u", "p", "s"].includes(e.key.toLowerCase())) ||
//         (e.ctrlKey &&
//           e.shiftKey &&
//           ["i", "j", "c"].includes(e.key.toLowerCase())) ||
//         e.key === "F12"
//       ) {
//         e.preventDefault();
//         window.location.href = "/";
//       }
//     };
//     document.addEventListener("keydown", blockShortcuts);

//     let devtools = { open: false };
//     const threshold = 160;
//     const checkDevTools = () => {
//       const widthThreshold = window.outerWidth - window.innerWidth > threshold;
//       const heightThreshold =
//         window.outerHeight - window.innerHeight > threshold;
//       if (widthThreshold || heightThreshold) {
//         if (!devtools.open) {
//           devtools.open = true;
//           window.location.href = "/";
//         }
//       } else {
//         devtools.open = false;
//       }
//     };
//     const interval = setInterval(checkDevTools, 1000);

//     return () => {
//       document.removeEventListener("contextmenu", disableContextMenu);
//       document.removeEventListener("keydown", blockShortcuts);
//       clearInterval(interval);
//     };
//   }, []);

//   return null;
// };

// export default SiteProtector;
