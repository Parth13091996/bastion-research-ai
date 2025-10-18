export const videoUrlWithEmbed = (url) =>
  `https://www.youtube.com/embed/${new URL(url).pathname.split("/").at(-1)}`;

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const getUserInfoToShowInPdf = (formData: any) => {
  const actualAddress = `
  Name: ${formData?.firstName || ""} ${formData?.lastName || ""}\n
  PAN: ${formData?.panCard || ""}\n
  Address: ${formData?.address1 || ""}\n
  ${formData?.address2 || ""}\n
  Email: ${formData?.email || ""}\n
  Phone Number: ${formData?.phone || ""}
  `;
  return actualAddress;
};
