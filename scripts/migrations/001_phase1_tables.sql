-- Phase 1 Migration: Support 3 User Roles and Customer Claimable Rewards

-- 1. Owner KYC Verifications
CREATE TABLE IF NOT EXISTS owner_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id TEXT NOT NULL REFERENCES places(place_id) ON DELETE CASCADE,
    owner_address VARCHAR(42) NOT NULL,
    applicant_name VARCHAR(150) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    contact_email VARCHAR(100),
    dbd_registered_name VARCHAR(200),
    dbd_company_id VARCHAR(50),
    id_card_photo_url TEXT NOT NULL,
    storefront_photo_url TEXT NOT NULL,
    utility_bill_url TEXT,
    dbd_document_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    admin_reviewer_address VARCHAR(42),
    admin_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ov_place_id ON owner_verifications(place_id);
CREATE INDEX IF NOT EXISTS idx_ov_owner_address ON owner_verifications(owner_address);
CREATE INDEX IF NOT EXISTS idx_ov_status ON owner_verifications(status);

-- 2. Verified Place Owners mapping
CREATE TABLE IF NOT EXISTS place_owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id TEXT NOT NULL UNIQUE REFERENCES places(place_id) ON DELETE CASCADE,
    owner_address VARCHAR(42) NOT NULL,
    verification_id UUID REFERENCES owner_verifications(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_po_place_id ON place_owners(place_id);
CREATE INDEX IF NOT EXISTS idx_po_owner_address ON place_owners(owner_address);

-- 3. Admin Activity Audit Logs
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_address VARCHAR(42) NOT NULL,
    action VARCHAR(50) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aal_created ON admin_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aal_admin ON admin_activity_logs(admin_address);

-- 4. Customer Claimable Rewards (Accumulator)
CREATE TABLE IF NOT EXISTS customer_claimable_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_address VARCHAR(42) NOT NULL,
    place_id TEXT REFERENCES places(place_id) ON DELETE SET NULL,
    review_id UUID REFERENCES verified_reviews(id) ON DELETE SET NULL,
    reward_type VARCHAR(30) NOT NULL, -- 'EPOCH_MINING', 'PIONEER_BONUS', 'BOUNTY'
    amount_taste NUMERIC(18, 8) NOT NULL DEFAULT 0,
    amount_avax NUMERIC(18, 8) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'UNCLAIMED', -- 'UNCLAIMED', 'CLAIMED'
    claimed_tx_hash VARCHAR(66),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    claimed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ccr_customer ON customer_claimable_rewards(customer_address, status);
CREATE INDEX IF NOT EXISTS idx_ccr_created ON customer_claimable_rewards(created_at DESC);
