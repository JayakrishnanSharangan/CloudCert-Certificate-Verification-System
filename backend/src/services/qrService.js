const QRCode = require('qrcode');

/**
 * Generate a Base64 Data URL QR Code for a certificate verification URL
 * @param {string} certificateId 
 * @param {string} baseUrl
 * @returns {Promise<string>}
 */
async function generateQRCode(certificateId, baseUrl = 'http://localhost:3000') {
  const verifyUrl = `${baseUrl}/?id=${encodeURIComponent(certificateId)}`;
  try {
    const dataUrl = await QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 2,
      width: 250,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR Code:', err);
    throw err;
  }
}

module.exports = {
  generateQRCode
};
