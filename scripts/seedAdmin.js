require('dotenv').config();
const { connectDb } = require('../src/config/db');
const { User } = require('../src/models/User');
const { ROLES } = require('../src/constants/roles');
const { hashPassword } = require('../src/utils/password');

async function seedAdmin() {
  const { MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
  if (!MONGO_URI) throw new Error('MONGO_URI is required');
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');

  await connectDb(MONGO_URI);

  const email = ADMIN_EMAIL.toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = ROLES.ADMIN;
    if (ADMIN_NAME) existing.name = ADMIN_NAME;
    await existing.save();
    console.log('Admin updated:', existing.email);
    process.exit(0);
  }

  const passwordHash = await hashPassword(ADMIN_PASSWORD);
  const user = await User.create({ name: ADMIN_NAME || 'Admin', email, passwordHash, role: ROLES.ADMIN });
  console.log('Admin created:', user.email);
  process.exit(0);
}

seedAdmin().catch((e) => {
  console.error(e);
  process.exit(1);
});
