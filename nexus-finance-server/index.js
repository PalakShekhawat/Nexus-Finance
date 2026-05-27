const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

// ─── Debug: print what Render actually sees ───────────────────────────────────
console.log('=== ENV CHECK ===');
console.log('NODE_ENV           :', process.env.NODE_ENV);
console.log('PORT               :', process.env.PORT);
console.log('MONGO_URI          :', process.env.MONGO_URI ? '✅ set' : '❌ MISSING');
console.log('JWT_ACCESS_SECRET  :', process.env.JWT_ACCESS_SECRET ? '✅ set' : '❌ MISSING');
console.log('JWT_REFRESH_SECRET :', process.env.JWT_REFRESH_SECRET ? '✅ set' : '❌ MISSING');
console.log('CLIENT_URL         :', process.env.CLIENT_URL || '(not set)');
console.log('=================');

// ─── Trim all secrets to remove invisible whitespace from copy-paste ──────────
process.env.JWT_ACCESS_SECRET  = (process.env.JWT_ACCESS_SECRET  || '').trim();
process.env.JWT_REFRESH_SECRET = (process.env.JWT_REFRESH_SECRET || '').trim();
process.env.MONGO_URI          = (process.env.MONGO_URI          || '').trim();
process.env.CLIENT_URL         = (process.env.CLIENT_URL         || '').trim();

// ─── Startup check ────────────────────────────────────────────────────────────
const missing = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET']
  .filter((k) => !process.env[k]);

if (missing.length > 0) {
  console.error('❌ FATAL: Missing env vars:', missing.join(', '));
  console.error('   Go to Render → your service → Environment and add them.');
  process.exit(1);
}

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

console.log('CORS allowed origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);           // Postman / curl / health checks
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn('CORS warning — unlisted origin:', origin);
    callback(null, true); // permissive so initial deploy never hard-fails on CORS
  },
  credentials: true,
}));

app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/budgets',      require('./routes/budgetRoutes'));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Nexus Finance Server is running!', env: process.env.NODE_ENV });
});

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// ─── MongoDB + start ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');

    try {
      const User = require('./models/User');
      const exists = await User.findOne({ email: 'admin@nexus.com' });
      if (!exists) {
        await User.create({ name: 'Administrator', email: 'admin@nexus.com', password: 'admin123' });
        console.log('✅ Demo admin created → admin@nexus.com / admin123');
      }
    } catch (e) {
      console.warn('⚠️  Seeder skipped:', e.message);
    }

    app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
