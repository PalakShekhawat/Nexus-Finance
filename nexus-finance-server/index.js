const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

// ─── Startup checks ───────────────────────────────────────────────────────────
const REQUIRED_ENV = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error('❌ FATAL: Missing required environment variables:', missing.join(', '));
  console.error('   Please check your .env file or Render environment settings.');
  process.exit(1);
}

const app = express();

// ─── Security middleware ───────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Allow the frontend origin (set CLIENT_URL on Render to your Vercel URL)
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173', // local dev
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Nexus Finance Server is running!', env: process.env.NODE_ENV });
});

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ─── Database + Server start ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');

    // Seed a demo admin user (only on first run)
    try {
      const User = require('./models/User');
      const adminEmail = 'admin@nexus.com';
      const adminExists = await User.findOne({ email: adminEmail });
      if (!adminExists) {
        await User.create({ name: 'Administrator', email: adminEmail, password: 'admin123' });
        console.log('✅ Demo admin created  →  email: admin@nexus.com  |  password: admin123');
      }
    } catch (seedErr) {
      console.warn('⚠️  Demo seeder skipped:', seedErr.message);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('   Check your MONGO_URI environment variable.');
    process.exit(1);
  });
