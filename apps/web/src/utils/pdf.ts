import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

async function fetchPdf(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

async function addAddressToPdf(
  pdfUrl: string,
  userInfo: Record<any, any>
): Promise<Uint8Array> {
  const existingPdfBytes = await fetchPdf(pdfUrl);

  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pages = pdfDoc.getPages();
  const firstPage = pages[7];

  const drawWrappedText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    size: number,
    lineHeight: number
  ) => {
    const words = (text || "").split(/\s+/).filter(Boolean);
    let line = "";
    let cursorY = y;

    const flush = (l: string) => {
      if (!l) return;
      firstPage.drawText(l, { x, y: cursorY, size, font, color: rgb(0, 0, 0) });
      cursorY -= lineHeight;
    };

    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, size);
      if (width > maxWidth) {
        flush(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    flush(line);
    return cursorY;
  };

  const pageHeight = firstPage.getHeight();
  const valueX = 302;
  const baseSize = 10;
  const rowGap = 24;

  const startY = pageHeight - 201;

  const fullName = (userInfo.fullName || userInfo.name || "").toString();
  const address = (userInfo.address || "").toString();
  const email = (userInfo.email || "").toString();
  const mobile = (userInfo.mobile || userInfo.phone || "").toString();
  const pan = (userInfo.pan || "").toString();

  firstPage.drawText(fullName, {
    x: valueX,
    y: startY,
    size: baseSize,
    font,
    color: rgb(0, 0, 0),
  });

  const addressYTop = startY - rowGap - 60;
  const afterAddressY = drawWrappedText(
    address,
    valueX,
    addressYTop,
    190,
    baseSize,
    12
  );

  const emailY = (afterAddressY ?? addressYTop) - 25;
  firstPage.drawText(email, {
    x: valueX,
    y: emailY,
    size: baseSize,
    font,
    color: rgb(0, 0, 0),
  });

  const mobileY = emailY - rowGap + 7;
  firstPage.drawText(mobile, {
    x: valueX,
    y: mobileY,
    size: baseSize,
    font,
    color: rgb(0, 0, 0),
  });

  const panY = mobileY - rowGap + 8;
  firstPage.drawText(pan, {
    x: valueX,
    y: panY,
    size: baseSize,
    font,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

export async function handlePersonalizedPdf(
  pdfUrl: string,
  address: Record<any, any>
): Promise<string> {
  const newPdfBytes = await addAddressToPdf(pdfUrl, address);

  return await new Promise((resolve, reject) => {
    //@ts-ignore
    const blob = new Blob([newPdfBytes], { type: "application/pdf" });
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;

      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
