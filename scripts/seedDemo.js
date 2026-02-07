require('dotenv').config();
const { connectDb } = require('../src/config/db');
const { User } = require('../src/models/User');
const { Event } = require('../src/models/Event');
const { EVENT_STATUS, EVENT_TYPES } = require('../src/constants/event');
const { ROLES } = require('../src/constants/roles');

function addHours(date, h) {
  return new Date(date.getTime() + h * 60 * 60 * 1000);
}

async function seedDemo() {
  const { MONGO_URI, ADMIN_EMAIL, DEMO_EVENTS_COUNT } = process.env;
  if (!MONGO_URI) throw new Error('MONGO_URI is required');

  await connectDb(MONGO_URI);
  const admin = await User.findOne({ email: (ADMIN_EMAIL || '').toLowerCase(), role: ROLES.ADMIN });
  if (!admin) throw new Error('Admin not found. Run: npm run seed:admin');

  const count = Math.max(3, parseInt(DEMO_EVENTS_COUNT || '6', 10));
  await Event.deleteMany({ organizerUser: admin._id });

  const now = new Date();
  const types = Object.values(EVENT_TYPES);

  const docs = Array.from({ length: count }).map((_, i) => {
    const startAt = addHours(now, 24 * (i + 1));
    const endAt = addHours(startAt, 2);
    return {
      title: `Community Initiative #${i + 1}`,
      description: `Demo event ${i + 1}. This is a sample description for a social initiative.`,
      type: types[i % types.length],
      status: EVENT_STATUS.PUBLISHED,
      startAt,
      endAt,
      location: `Campus Hall ${i + 1}`,
      capacity: 20 + i * 5,
      organizerUser: admin._id
    };
  });

  await Event.insertMany(docs);
  console.log(`Seeded ${docs.length} events for admin ${admin.email}`);
  process.exit(0);
}

seedDemo().catch((e) => {
  console.error(e);
  process.exit(1);
});
