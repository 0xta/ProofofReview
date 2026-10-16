import crypto from 'crypto';
import QRCode from 'qrcode';

const QR_SECRET_SALT = process.env.QR_SECRET_SALT || 'tastechain-bangkok-qr-salt-2026';

export interface ShopQRPayload {
  protocol: 'TASTECHAIN_BKK';
  type: 'IN_STORE_COUNTER_QR';
  place_id: string;
  venue_name: string;
  nonce: string;
  epoch_date: string; // YYYY-MM-DD
  checkin_url: string;
}

/**
 * Returns today's date formatted as YYYY-MM-DD (Bangkok UTC+7)
 */
export function getBangkokDateString(offsetDays: number = 0): string {
  const now = new Date();
  if (offsetDays !== 0) {
    now.setDate(now.getDate() + offsetDays);
  }
  // Format in Asia/Bangkok
  const bkk = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  return bkk;
}

/**
 * Generates a cryptographic 16-character daily nonce for a venue
 */
export function generateShopDailyNonce(placeId: string, dateStr?: string): string {
  const date = dateStr || getBangkokDateString();
  const hmac = crypto.createHmac('sha256', QR_SECRET_SALT);
  hmac.update(`${placeId}:${date}`);
  return hmac.digest('hex').slice(0, 16);
}

/**
 * Validates whether a provided nonce matches today's or yesterday's valid shop nonce
 */
export function verifyShopDailyNonce(placeId: string, nonce: string): boolean {
  if (!nonce || nonce.trim() === '') return false;

  const todayNonce = generateShopDailyNonce(placeId, getBangkokDateString(0));
  if (nonce === todayNonce) return true;

  // Allow 24-hour grace window for late-night dining
  const yesterdayNonce = generateShopDailyNonce(placeId, getBangkokDateString(-1));
  if (nonce === yesterdayNonce) return true;

  return false;
}

/**
 * Generates the In-Store Counter QR Code as a Data URL with JSON payload
 */
export async function generateShopQRCode(params: {
  placeId: string;
  venueName: string;
  baseUrl?: string;
}): Promise<{
  qrDataUrl: string;
  nonce: string;
  epochDate: string;
  payload: ShopQRPayload;
}> {
  const { placeId, venueName, baseUrl = 'http://localhost:3002' } = params;
  const epochDate = getBangkokDateString();
  const nonce = generateShopDailyNonce(placeId, epochDate);

  const payload: ShopQRPayload = {
    protocol: 'TASTECHAIN_BKK',
    type: 'IN_STORE_COUNTER_QR',
    place_id: placeId,
    venue_name: venueName,
    nonce,
    epoch_date: epochDate,
    checkin_url: `${baseUrl}/customer?place_id=${encodeURIComponent(placeId)}&nonce=${nonce}`,
  };

  const payloadString = JSON.stringify(payload);

  const qrDataUrl = await QRCode.toDataURL(payloadString, {
    width: 420,
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
  });

  return {
    qrDataUrl,
    nonce,
    epochDate,
    payload,
  };
}

export const generateDailyNonce = generateShopDailyNonce;
export const verifyDailyNonce = verifyShopDailyNonce;
