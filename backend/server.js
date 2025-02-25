require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const organizerRoutes = require('./routes/organizerRoutes');
const walletRoutes = require('./routes/walletRoutes');
const eventRoutes = require('./routes/eventRoutes');
const sequelize = require('./config/database');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// הגבלת בקשות
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 דקות
  max: 100, // מגביל ל-100 בקשות לכל IP
});
app.use(limiter);

  // Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/organizers', organizerRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/events', eventRoutes);

// בדיקת חיבור למסד נתונים
sequelize.authenticate()
  .then(() => console.log('✅ Connected to database'))
  .catch(err => console.error('❌ Database connection error:', err));

// הפעלת השרת
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
