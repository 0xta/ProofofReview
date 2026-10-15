import { pool, query } from '../src/lib/db';
import { getPlaces, getPlaceById, getPlatformStats } from '../src/lib/services/places';

async function runPhase1Tests() {
  console.log('====================================================');
  console.log('🧪 RUNNING PHASE 1 AUTOMATED TESTS & VERIFICATIONS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Test Database Connectivity
    console.log('--- 1. Testing Database Connectivity ---');
    const dbTest = await query<{ current_db: string; now: string }>('SELECT current_database() as current_db, NOW() as now');
    assert(dbTest.length > 0 && dbTest[0].current_db === 'tastechain', 'Connected to PostgreSQL database "tastechain"');

    // 2. Test Migration Tables
    console.log('\n--- 2. Verifying Phase 1 Companion Tables ---');
    const tables = ['owner_verifications', 'place_owners', 'admin_activity_logs', 'customer_claimable_rewards'];
    for (const table of tables) {
      const tableCheck = await query<{ exists: boolean }>(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = $1
        ) as exists`,
        [table]
      );
      assert(tableCheck[0]?.exists === true, `Table "${table}" exists in public schema`);
    }

    // 3. Test Places Service & Pagination
    console.log('\n--- 3. Testing Places Query Service ---');
    const placesResult = await getPlaces({ limit: 5, offset: 0 });
    assert(placesResult.places.length === 5, `Fetched ${placesResult.places.length} places (expected 5)`);
    assert(placesResult.total > 40000, `Total Bangkok places count is ${placesResult.total} (> 40,000 places)`);
    
    const sample = placesResult.places[0];
    console.log(`   Sample Venue: "${sample.name}" in ${sample.city} (Rating: ${sample.rating || 'N/A'})`);
    assert(!!sample.place_id && !!sample.name, 'Place object contains valid place_id and name');

    // 4. Test Search Filtering
    console.log('\n--- 4. Testing Search & Category Filter ---');
    const searchResult = await getPlaces({ search: 'Siam', limit: 3 });
    assert(searchResult.places.length > 0, `Search for "Siam" matched ${searchResult.total} venues`);

    // 5. Test Place by ID
    console.log('\n--- 5. Testing getPlaceById() ---');
    const byId = await getPlaceById(sample.place_id);
    assert(byId !== null && byId.place_id === sample.place_id, `Retrieved place by ID "${sample.place_id}" successfully`);

    // 6. Test Platform Stats Aggregator
    console.log('\n--- 6. Testing Platform Stats Aggregator ---');
    const stats = await getPlatformStats();
    assert(stats.totalPlaces > 90000, `Total places in DB: ${stats.totalPlaces} (> 90k)`);
    assert(stats.bkkPlaces > 40000, `Bangkok places: ${stats.bkkPlaces} (> 40k)`);
    assert(stats.dailyEmissionRate === 10000, 'Daily token emission rate configured at 10,000 $TASTE');

    console.log('\n====================================================');
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runPhase1Tests();
