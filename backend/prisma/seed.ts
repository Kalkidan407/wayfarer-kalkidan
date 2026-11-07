import { PrismaClient } from '../node_modules/.prisma/client/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Clearing old data layers...');
  await prisma.booking.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.tourSlot.deleteMany({});
  await prisma.place.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.$executeRawUnsafe('DELETE FROM sqlite_sequence');

  console.log('👥 Seeding 3 core users...');
  const user1 = await prisma.user.create({ data: { name: 'Sara' } });
  const user2 = await prisma.user.create({ data: { name: 'Abel' } });
  const user3 = await prisma.user.create({ data: { name: 'Liya' } });

  console.log('🏛️ Seeding 10 distinct places with review histories...');

  // 1. National Museum (History) - High volume, high score
  const museum = await prisma.place.create({
    data: { name: 'National Museum', category: 'History', description: 'Home of Lucy and ancient treasures.', openingHours: '08:30–17:30' }
  });
  await prisma.review.createMany({
    data: [
      { placeId: museum.id, userId: user1.id, rating: 5, body: 'Go early, the guide is excellent.' },
      { placeId: museum.id, userId: user2.id, rating: 4, body: 'Great, but the café was closed.' },
      { placeId: museum.id, userId: user3.id, rating: 5, body: 'Incredible historical legacy!' }
    ]
  });

  // 2. Brand-new Café (Food) - Single 5-star review (The Misleading Placeholder)
  const newCafe = await prisma.place.create({
    data: { name: 'Brand-new Café', category: 'Food', description: 'Freshly roasted local coffee beams.', openingHours: '07:00–22:00' }
  });
  await prisma.review.create({
    data: { placeId: newCafe.id, userId: user1.id, rating: 5, body: 'Amazing macchiato, first customer!' }
  });

  // 3. Entoto Park (Nature)
  const entoto = await prisma.place.create({
    data: { name: 'Entoto Park', category: 'Nature', description: 'Stunning panoramic views and walking trails.', openingHours: '06:00–20:00' }
  });
  await prisma.review.createMany({
    data: [
      { placeId: entoto.id, userId: user2.id, rating: 4, body: 'Very peaceful place.' },
      { placeId: entoto.id, userId: user3.id, rating: 5, body: 'Clean air and great running tracks.' }
    ]
  });

  // 4-10. Seed Remaining Places to hit exactly 10 items
  const placesData = [
    { name: 'Holy Trinity Cathedral', category: 'History', description: 'Beautiful architecture and historical tombs.', openingHours: '08:00–18:00', rating: 4 },
    { name: 'Corner Coffee House', category: 'Food', description: 'Traditional jebena coffee experience.', openingHours: '06:00–23:00', rating: 4 },
    { name: 'Unity Park', category: 'Nature', description: 'Sprawling palace grounds and zoo facilities.', openingHours: '09:00–16:00', rating: 5 },
    { name: 'Mercato Market Tour', category: 'Food', description: 'Vibrant, busy open-air commercial hub.', openingHours: '08:00–17:00', rating: 3 },
    { name: 'Red Terror Museum', category: 'History', description: 'Moving memorial and powerful history lessons.', openingHours: '09:00–18:00', rating: 5 },
    { name: 'Sheger Park', category: 'Nature', description: 'Relaxing waterfront landscaping elements.', openingHours: '07:00–19:00', rating: 4 },
    { name: 'Bole Bistro', category: 'Food', description: 'Modern fusion culinary plates.', openingHours: '11:00–23:00', rating: 4 }
  ];

  for (const p of placesData) {
    const createdPlace = await prisma.place.create({
      data: { name: p.name, category: p.category, description: p.description, openingHours: p.openingHours }
    });
    await prisma.review.create({
      data: { placeId: createdPlace.id, userId: user2.id, rating: p.rating, body: 'Good overall experience.' }
    });
  }

  console.log('🎟️ Seeding tour slots for multiple places...');

  const slotSeeds = [
    {
      placeId: museum.id,
      startsAt: new Date('2026-11-07T09:00:00Z'),
      capacity: 10,
      bookings: [
        { userId: user1.id, seats: 4 },
        { userId: user2.id, seats: 5 }
      ]
    },
    {
      placeId: museum.id,
      startsAt: new Date('2026-11-07T13:30:00Z'),
      capacity: 12,
      bookings: [
        { userId: user3.id, seats: 2 }
      ]
    },
    {
      placeId: newCafe.id,
      startsAt: new Date('2026-11-07T08:00:00Z'),
      capacity: 8,
      bookings: [
        { userId: user1.id, seats: 2 },
        { userId: user3.id, seats: 3 }
      ]
    },
    {
      placeId: newCafe.id,
      startsAt: new Date('2026-11-07T17:30:00Z'),
      capacity: 10,
      bookings: []
    },
    {
      placeId: entoto.id,
      startsAt: new Date('2026-11-08T07:15:00Z'),
      capacity: 14,
      bookings: [
        { userId: user2.id, seats: 2 }
      ]
    },
    {
      placeId: entoto.id,
      startsAt: new Date('2026-11-08T10:00:00Z'),
      capacity: 16,
      bookings: []
    }
  ];

  for (const slot of slotSeeds) {
    await prisma.tourSlot.create({
      data: {
        placeId: slot.placeId,
        startsAt: slot.startsAt,
        capacity: slot.capacity,
        bookings: slot.bookings.length
          ? { createMany: { data: slot.bookings } }
          : undefined
      }
    });
  }

  console.log('✅ Seeding complete! 10 places and multiple tour slots established.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
