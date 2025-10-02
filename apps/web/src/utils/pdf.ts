import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Fetch the PDF as ArrayBuffer
async function fetchPdf(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

async function addAddressToPdf(pdfUrl: string, address: string): Promise<Uint8Array> {
  const existingPdfBytes = await fetchPdf(pdfUrl);

  // Load the PDF
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  // Embed a font
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Get the first page
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  // Draw the address at desired position (x, y)
  firstPage.drawText(address, {
    x: 50,
    y: firstPage.getHeight() - 20, // 100 units from top
    size: 14,
    font,
    lineHeight: 10,
    color: rgb(0, 0, 0),
  });

  // Serialize the PDF
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

// ... existing code ...
export async function handlePersonalizedPdf(pdfUrl: string, address: string): Promise<string> {
    const newPdfBytes = await addAddressToPdf(pdfUrl, address);
  
    // Convert the PDF bytes to a base64 string using Blob and FileReader
    return await new Promise((resolve, reject) => {
        //@ts-ignore
      const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
      const reader = new FileReader();
      reader.onloadend = () => {
        // reader.result is like "data:application/pdf;base64,...."
        const result = reader.result as string;
        // Remove the "data:application/pdf;base64," prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }