import QRCode from "qrcode";

export const generateQRCodeImage = async (url: string): Promise<string> => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 300,
      margin: 1,
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
};

export const generateQRCodeBuffer = async (url: string): Promise<Buffer> => {
  try {
    const buffer = await QRCode.toBuffer(url, {
      errorCorrectionLevel: "H",
      type: "png",
      width: 300,
      margin: 1,
    });
    return buffer;
  } catch (error) {
    console.error("Error generating QR code buffer:", error);
    throw error;
  }
};
