import axios from 'axios';

// I use chatGPT to generate this test
async function runValidationSuite() {
  console.log('🧪 STARTING WAYFARER TESTING SUITE...\n');

  // ==========================================
  // TEST 1: HONEST RANKING MATHEMATICS
  // ==========================================
  console.log('📋 Running Test 1: Honest Ranking Math...');
  try {
    const placesRes = await axios.get('http://localhost:3000/places');
    const places = placesRes.data;

    const museumIndex = places.findIndex((p: any) => p.name === 'National Museum');
    const cafeIndex = places.findIndex((p: any) => p.name === 'Brand-new Café');

    console.log(`   - National Museum Position: #${museumIndex + 1} (Score: ${places[museumIndex]?.weightedScore})`);
    console.log(`   - Brand-new Café Position:  #${cafeIndex + 1} (Score: ${places[cafeIndex]?.weightedScore})`);

    if (museumIndex < cafeIndex) {
      console.log('   ✅ PASS: Established place correctly outranks high-scoring single-review flukes!');
    } else {
      console.error('   🚨 FAIL: Misleading ratings bug detected!');
      process.exit(1);
    }
  } catch (err: any) {
    console.error('   🚨 FAIL: Could not query places endpoint. Make sure server is running.', err.message);
    process.exit(1);
  }

  console.log('\n--------------------------------------------------\n');

  // ==========================================
  // TEST 2: CONCURRENT PARALLEL BOOKING SAFETY
  // ==========================================
  console.log('🔥 Running Test 2: Parallel Concurrency Booking Safety...');
  const SLOT_ID = 1; // Seeded slot with 9/10 seats taken, only 1 left
  
  // Prepare a burst array of 10 simultaneous booking attempts
  const parallelBurst = Array.from({ length: 10 }).map((_, i) => {
    const mockUserHeaderId = (i + 1).toString();
    return axios.post(
      'http://localhost:3000/bookings',
      { slotId: SLOT_ID, seats: 1 },
      { headers: { 'X-User-Id': mockUserHeaderId } }
    );
  });

  console.log('   - Blasting endpoint with 10 concurrent requests at the same millisecond...');
  const executionResults = await Promise.allSettled(parallelBurst);

  let approved = 0;
  let blocked = 0;

  executionResults.forEach((res) => {
    if (res.status === 'fulfilled') approved++;
    else blocked++;
  });

  console.log(`   - Total Approved Confirmations: ${approved}`);
  console.log(`   - Total Graceful Rejections:   ${blocked}`);

  if (approved === 1) {
    console.log('   ✅ PASS: Serializable database transaction lock held perfectly! Zero overbookings occurred.');
  } else {
    console.error(`   🚨 FAIL: Overbooking occurred! Allowed ${approved} reservations on a single seat.`);
    process.exit(1);
  }

  console.log('\n🏆 ALL MANDATORY TESTS PASSED SUCCESSFULY!');
}

runValidationSuite();
