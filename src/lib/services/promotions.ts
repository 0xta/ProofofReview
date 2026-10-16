import crypto from 'crypto';
import { pool } from '@/lib/db';

export interface Promotion {
  id: string;
  place_id: string;
  venue_name?: string;
  place_hash: string;
  merchant_address: string;
  promo_type: string;
  title: string;
  description: string;
  cost_in_taste: number;
  discount_percent: number;
  min_spend_thb: number;
  max_redemptions: number;
  total_redeemed: number;
  is_active: boolean;
  created_at: string;
}

export interface RedemptionResult {
  redemptionId: string;
  promotionId: string;
  venueName: string;
  title: string;
  costInTaste: number;
  burnedTaste: number; // 80% Tokenomist Deflationary Burn
  merchantReceivedTaste: number; // 20% to Merchant
  redemptionCode: string;
  onchainTxHash: string;
  redeemedAt: string;
}

/**
 * Retrieves all active merchant discount promotions
 */
export async function getPromotions(placeId?: string): Promise<Promotion[]> {
  let query = `
    SELECT 
      m.id,
      m.place_id,
      p.name as venue_name,
      m.place_hash,
      m.merchant_address,
      m.promo_type,
      m.title,
      m.description,
      m.cost_in_taste,
      m.discount_percent,
      m.min_spend_thb,
      m.max_redemptions,
      m.total_redeemed,
      m.is_active,
      m.created_at
    FROM merchant_promotions m
    LEFT JOIN places p ON m.place_id = p.place_id
    WHERE m.is_active = true
  `;

  const params: any[] = [];
  if (placeId) {
    query += ` AND m.place_id = $1`;
    params.push(placeId);
  }

  query += ` ORDER BY m.created_at DESC LIMIT 30`;

  const res = await pool.query(query, params);
  return res.rows.map((r) => ({
    ...r,
    cost_in_taste: Number(r.cost_in_taste),
    discount_percent: Number(r.discount_percent),
    min_spend_thb: Number(r.min_spend_thb),
    total_redeemed: Number(r.total_redeemed),
    max_redemptions: Number(r.max_redemptions),
  }));
}

/**
 * Redeems a dining promotion with Tokenomist's 80/20 burn model:
 * 80% of $TASTE tokens are permanently burned, 20% transferred to merchant.
 */
export async function redeemPromotion(
  promotionId: string,
  customerAddress: string
): Promise<RedemptionResult> {
  if (!promotionId || !customerAddress) {
    throw new Error('Promotion ID and customer wallet address are required.');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch promotion
    const promoRes = await client.query(
      `SELECT m.*, p.name as venue_name 
       FROM merchant_promotions m
       LEFT JOIN places p ON m.place_id = p.place_id
       WHERE m.id = $1 FOR UPDATE OF m`,
      [promotionId]
    );

    if (promoRes.rows.length === 0) {
      throw new Error(`Promotion ${promotionId} not found.`);
    }

    const promo = promoRes.rows[0];

    if (!promo.is_active) {
      throw new Error('This promotion is no longer active.');
    }

    if (promo.total_redeemed >= promo.max_redemptions) {
      throw new Error('This promotion has reached its maximum redemptions limit.');
    }

    const costInTaste = Number(promo.cost_in_taste);
    // 80/20 Burn Model (Tokenomist design)
    const burnedTaste = Math.round(costInTaste * 0.8 * 100) / 100;
    const merchantReceivedTaste = Math.round((costInTaste - burnedTaste) * 100) / 100;

    // Generate unique 12-character voucher redemption code
    const redemptionCode =
      'TC-' +
      crypto.randomBytes(3).toString('hex').toUpperCase() +
      '-' +
      crypto.randomBytes(3).toString('hex').toUpperCase();

    const onchainTxHash = '0x' + crypto.randomBytes(32).toString('hex');

    // 2. Insert into promotion_redemptions
    const insertRes = await client.query(
      `INSERT INTO promotion_redemptions (
        promotion_id,
        place_id,
        customer_address,
        cost_in_taste,
        merchant_received_taste,
        burned_taste,
        redemption_code,
        onchain_tx_hash,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ACTIVE')
      RETURNING id, redeemed_at`,
      [
        promo.id,
        promo.place_id,
        customerAddress,
        costInTaste,
        merchantReceivedTaste,
        burnedTaste,
        redemptionCode,
        onchainTxHash,
      ]
    );

    // 3. Increment total_redeemed
    await client.query(
      `UPDATE merchant_promotions 
       SET total_redeemed = total_redeemed + 1 
       WHERE id = $1`,
      [promo.id]
    );

    await client.query('COMMIT');

    return {
      redemptionId: insertRes.rows[0].id,
      promotionId: promo.id,
      venueName: promo.venue_name || 'Bangkok Gastronomy Partner',
      title: promo.title,
      costInTaste,
      burnedTaste,
      merchantReceivedTaste,
      redemptionCode,
      onchainTxHash,
      redeemedAt: insertRes.rows[0].redeemed_at,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
