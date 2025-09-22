export const videoUrlWithEmbed = (url) =>
  `https://www.youtube.com/embed/${new URL(url).pathname.split("/").at(-1)}`;
