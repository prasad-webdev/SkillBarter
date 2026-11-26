import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './config/db';

import authRoutes         from './routes/auth';
import userRoutes         from './routes/users';
import sessionRoutes      from './routes/sessions';
import walletRoutes       from './routes/wallet';
import skillRoutes        from './routes/skills';
import notificationRoutes from './routes/notifications';
import proposalRoutes     from './routes/proposals';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/sessions',      sessionRoutes);
app.use('/api/wallet',        walletRoutes);
app.use('/api/skills',        skillRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/proposals',     proposalRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'SkillBarter API running ✅' });
});

app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected! (SQLite)');
    console.log(`🚀 Server → http://localhost:${PORT}`);
  } catch (error: any) {
    console.error('❌ DB error:', error.message);
    process.exit(1);
  }
});

export default app;
