import { query } from '../db';

export interface Place {
  id: string;
  place_id: string;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  description: string | null;
  google_map_url: string | null;
  latitude: number | null;
  longitude: number | null;
  service_type: string | null;
  business_status: string | null;
  website: string | null;
  rating: number | null;
  total_reviews: number | null;
  shop_quality_score: number | null;
  created_at: string;
  // Dynamic aggregations
  has_owner?: boolean;
  active_bounties_count?: number;
  promotions_count?: number;
  voices_count?: number;
}

export interface PlaceFilterParams {
  search?: string;
  city?: string;
  serviceType?: string;
  minRating?: number;
  hasBounty?: boolean;
  limit?: number;
  offset?: number;
}

export async function getPlaces(params: PlaceFilterParams = {}): Promise<{ places: Place[]; total: number }> {
  const {
    search,
    city = 'กรุงเทพมหานคร',
    serviceType,
    minRating,
    hasBounty,
    limit = 20,
    offset = 0,
  } = params;

  const conditions: string[] = ["p.business_status = 'OPERATIONAL'"];
  const values: any[] = [];
  let paramIndex = 1;

  if (city && city !== 'ALL') {
    conditions.push(`p.city = $${paramIndex++}`);
    values.push(city);
  }

  if (search && search.trim() !== '') {
    conditions.push(`(p.name ILIKE $${paramIndex} OR p.address ILIKE $${paramIndex})`);
    values.push(`%${search.trim()}%`);
    paramIndex++;
  }

  if (serviceType && serviceType !== 'ALL') {
    conditions.push(`p.service_type ILIKE $${paramIndex++}`);
    values.push(`%${serviceType}%`);
  }

  if (minRating && minRating > 0) {
    conditions.push(`p.rating >= $${paramIndex++}`);
    values.push(minRating);
  }

  if (hasBounty) {
    conditions.push(`EXISTS (SELECT 1 FROM merchant_bounties mb WHERE mb.place_id = p.place_id AND mb.status = 'ACTIVE')`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countQuery = `SELECT count(*)::int AS total FROM places p ${whereClause}`;
  const countRes = await query<{ total: number }>(countQuery, values);
  const total = countRes[0]?.total || 0;

  // Get paginated places with owner, bounty, and voice counts
  const dataQuery = `
    SELECT 
      p.id,
      p.place_id,
      p.name,
      p.address,
      p.city,
      p.country,
      p.description,
      p.google_map_url,
      p.latitude,
      p.longitude,
      p.service_type,
      p.business_status,
      p.website,
      p.rating,
      p.total_reviews,
      p.shop_quality_score,
      p.created_at,
      EXISTS (SELECT 1 FROM place_owners po WHERE po.place_id = p.place_id) AS has_owner,
      (SELECT count(*)::int FROM merchant_bounties mb WHERE mb.place_id = p.place_id AND mb.status = 'ACTIVE') AS active_bounties_count,
      (SELECT count(*)::int FROM merchant_promotions mp WHERE mp.place_id = p.place_id AND mp.is_active = true) AS promotions_count,
      (SELECT count(*)::int FROM shop_voices sv WHERE sv.place_id = p.place_id AND sv.is_active = true) AS voices_count
    FROM places p
    ${whereClause}
    ORDER BY p.rating DESC NULLS LAST, p.total_reviews DESC NULLS LAST
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;

  const places = await query<Place>(dataQuery, [...values, limit, offset]);

  return { places, total };
}

export async function getPlaceById(placeId: string): Promise<Place | null> {
  const q = `
    SELECT 
      p.id,
      p.place_id,
      p.name,
      p.address,
      p.city,
      p.country,
      p.description,
      p.google_map_url,
      p.latitude,
      p.longitude,
      p.service_type,
      p.business_status,
      p.website,
      p.rating,
      p.total_reviews,
      p.shop_quality_score,
      p.created_at,
      EXISTS (SELECT 1 FROM place_owners po WHERE po.place_id = p.place_id) AS has_owner,
      (SELECT count(*)::int FROM merchant_bounties mb WHERE mb.place_id = p.place_id AND mb.status = 'ACTIVE') AS active_bounties_count,
      (SELECT count(*)::int FROM merchant_promotions mp WHERE mp.place_id = p.place_id AND mp.is_active = true) AS promotions_count,
      (SELECT count(*)::int FROM shop_voices sv WHERE sv.place_id = p.place_id AND sv.is_active = true) AS voices_count
    FROM places p
    WHERE p.place_id = $1 OR p.id::text = $1
    LIMIT 1
  `;
  const res = await query<Place>(q, [placeId]);
  return res[0] || null;
}

export async function getPlatformStats() {
  const [placesRes, reviewsRes, bountiesRes, promotionsRes, ownersRes] = await Promise.all([
    query<{ total_places: number; bkk_places: number }>(`
      SELECT 
        count(*)::int AS total_places,
        count(*) FILTER (WHERE city = 'กรุงเทพมหานคร')::int AS bkk_places
      FROM places
    `),
    query<{ total_reviews: number; total_pioneers: number }>(`
      SELECT 
        count(*)::int AS total_reviews,
        count(*) FILTER (WHERE is_pioneer = true)::int AS total_pioneers
      FROM verified_reviews
    `),
    query<{ active_bounties: number; total_budget_avax: number }>(`
      SELECT 
        count(*) FILTER (WHERE status = 'ACTIVE')::int AS active_bounties,
        COALESCE(SUM(total_budget_avax), 0)::float AS total_budget_avax
      FROM merchant_bounties
    `),
    query<{ active_promotions: number; total_redeemed: number }>(`
      SELECT 
        count(*) FILTER (WHERE is_active = true)::int AS active_promotions,
        COALESCE(SUM(total_redeemed), 0)::int AS total_redeemed
      FROM merchant_promotions
    `),
    query<{ verified_owners: number }>(`
      SELECT count(*)::int AS verified_owners FROM place_owners
    `),
  ]);

  return {
    totalPlaces: placesRes[0]?.total_places || 0,
    bkkPlaces: placesRes[0]?.bkk_places || 0,
    totalReviews: reviewsRes[0]?.total_reviews || 0,
    totalPioneers: reviewsRes[0]?.total_pioneers || 0,
    activeBounties: bountiesRes[0]?.active_bounties || 0,
    totalBountyAvax: bountiesRes[0]?.total_budget_avax || 0,
    activePromotions: promotionsRes[0]?.active_promotions || 0,
    totalRedeemed: promotionsRes[0]?.total_redeemed || 0,
    verifiedOwners: ownersRes[0]?.verified_owners || 0,
    dailyEmissionRate: 10000, // 10,000 $TASTE per day
  };
}
