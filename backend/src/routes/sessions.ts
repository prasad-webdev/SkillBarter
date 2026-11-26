import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/db';
import authMiddleware, { AuthRequest } from '../middleware/auth';

const router = express.Router();

// ── POST /api/sessions  — Book a session ─────────────────────
router.post(
  '/',
  authMiddleware,
  [
    body('mentorId').isInt().withMessage('Invalid mentor ID'),
    body('skillTopic').notEmpty().withMessage('Skill topic is required'),
    body('scheduledAt').isISO8601().withMessage('Please provide a valid date and time'),
    body('credits').isInt({ min: 1 }).withMessage('Credits must be at least 1'),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const learnerId = Number(req.user!.userId);
      const { mentorId, skillTopic, scheduledAt, credits, durationMin, notes } = req.body;

      // Check learner has enough credits
      const wallet = await prisma.wallet.findUnique({ where: { userId: learnerId } });
      if (!wallet || wallet.balance < credits) {
        return res.status(400).json({ success: false, message: 'Insufficient skill credits in wallet' });
      }

      // Create session + hold credits in escrow
      const session = await prisma.$transaction(async (tx) => {
        const newSession = await tx.session.create({
          data: {
            mentorId: Number(mentorId),
            learnerId,
            skillTopic,
            scheduledAt: new Date(scheduledAt),
            durationMin: durationMin || 60,
            credits: Number(credits),
            notes,
            status: 'pending',
          },
        });

        // Deduct credits from learner wallet (escrow)
        await tx.wallet.update({
          where: { userId: learnerId },
          data: { balance: { decrement: Number(credits) } },
        });

        // Record transaction
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            userId: learnerId,
            amount: Number(credits),
            type: 'debit',
            description: `Session booked: ${skillTopic}`,
          },
        });

        // Create escrow record
        await tx.escrow.create({
          data: { sessionId: newSession.id, amount: Number(credits), status: 'held' },
        });

        return newSession;
      });

      return res.status(201).json({ success: true, message: 'Session booked successfully!', session });
    } catch (error) {
      console.error('Book session error:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// ── GET /api/sessions  — List sessions for logged-in user ────
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user!.userId);
    const sessions = await prisma.session.findMany({
      where: { OR: [{ mentorId: userId }, { learnerId: userId }] },
      include: {
        mentor:  { select: { id: true, name: true, email: true } },
        learner: { select: { id: true, name: true, email: true } },
        escrow:  { select: { status: true, amount: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
    return res.json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── PATCH /api/sessions/:id/meeting-link  — Mentor adds link ─
router.patch('/:id/meeting-link', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { meetingLink } = req.body;
    if (!meetingLink) {
      return res.status(400).json({ success: false, message: 'Meeting link is required' });
    }
    const session = await prisma.session.update({
      where: { id: Number(req.params.id) },
      data:  { meetingLink, status: 'confirmed' },
    });
    return res.json({ success: true, message: 'Meeting link added ✅', session });
  } catch (error) {
    console.error('Update meeting link error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── PATCH /api/sessions/:id/complete  — Mark session done ────
router.patch('/:id/complete', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const sessionId = Number(req.params.id);

    await prisma.$transaction(async (tx) => {
      const session = await tx.session.findUnique({ where: { id: sessionId } });
      if (!session) throw new Error('Session not found');

      // Mark session completed
      await tx.session.update({ where: { id: sessionId }, data: { status: 'completed' } });

      // Release escrow — pay mentor
      await tx.escrow.update({
        where: { sessionId },
        data: { status: 'released', releasedAt: new Date() },
      });

      // Add credits to mentor wallet
      const mentorWallet = await tx.wallet.findUnique({ where: { userId: session.mentorId } });
      if (mentorWallet) {
        await tx.wallet.update({
          where: { userId: session.mentorId },
          data: { balance: { increment: session.credits } },
        });
        await tx.transaction.create({
          data: {
            walletId: mentorWallet.id,
            userId: session.mentorId,
            amount: session.credits,
            type: 'credit',
            description: `Session completed: ${session.skillTopic}`,
          },
        });
      }
    });

    return res.json({ success: true, message: 'Session marked as completed. Credits released to mentor.' });
  } catch (error) {
    console.error('Complete session error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
