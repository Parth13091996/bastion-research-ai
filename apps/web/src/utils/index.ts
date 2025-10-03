export const videoUrlWithEmbed = (url) =>
  `https://www.youtube.com/embed/${new URL(url).pathname.split("/").at(-1)}`;

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const getUserInfoToShowInPdf = () => {
  const storedFormData = JSON.parse(
    localStorage.getItem("onboardingFormData") || ""
  );
  const actualAddress = `
  Name: ${storedFormData.firstName} ${storedFormData.lastName}\n
  PAN: ${storedFormData.panCard}\n
  Address: ${storedFormData.address1}\n
  ${storedFormData.address2}\n
  Email: ${storedFormData.email}\n
  Phone Number: ${storedFormData.phone}
  `;
  return actualAddress;
};
