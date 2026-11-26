import express, { Response } from 'express';
import prisma from '../config/db';
import authMiddleware, { AuthRequest } from '../middleware/auth';

const router = express.Router();

// ── GET /api/wallet  — Get current user wallet & transactions ─
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user!.userId);

    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }

    return res.json({ success: true, wallet });
  } catch (error) {
    console.error('Get wallet error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
