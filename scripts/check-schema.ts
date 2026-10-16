import { pool } from '../src/lib/db';

async function main() {
  const tables = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
  );
  console.log('Tables:', tables.rows.map(r => r.table_name));

  for (const t of ['merchant_bounties', 'merchant_promotions', 'promotion_redemptions', 'pioneer_claims']) {
    const cols = await pool.query(
      `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name=$1 ORDER BY ordinal_position`,
      [t]
    );
    console.log(`\n--- ${t} columns ---`);
    console.log(cols.rows.map(c => `${c.column_name} (${c.data_type})`));
  }

  await pool.end();
}

main().catch(console.error);
