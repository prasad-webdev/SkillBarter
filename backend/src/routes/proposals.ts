import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/db';
import authMiddleware, { AuthRequest } from '../middleware/auth';

const router = express.Router();

// ── POST /api/proposals — Send a swap proposal ────────────────
router.post('/', authMiddleware,
  [
    body('toUserId').isInt().withMessage('Invalid target user'),
    body('offeredSkill').notEmpty().withMessage('Please enter the skill you are offering'),
    body('wantedSkill').notEmpty().withMessage('Please enter the skill you want in return'),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const fromUserId = Number(req.user!.userId);
      const { toUserId, offeredSkill, wantedSkill, message } = req.body;

      if (fromUserId === Number(toUserId))
        return res.status(400).json({ success: false, message: 'You cannot send a proposal to yourself' });

      const proposal = await prisma.proposal.create({
        data: { fromUserId, toUserId: Number(toUserId), offeredSkill, wantedSkill, message },
        include: {
          fromUser: { select: { id: true, name: true, email: true } },
          toUser:   { select: { id: true, name: true, email: true } },
        },
      });

      // Create notification for recipient
      await prisma.notification.create({
        data: {
          userId:  Number(toUserId),
          title:   '📩 New Skill Swap Proposal',
          message: `${proposal.fromUser.name} wants to swap "${offeredSkill}" for "${wantedSkill}"`,
        },
      });

      return res.status(201).json({ success: true, message: 'Proposal sent successfully!', proposal });
    } catch (error) {
      console.error('Send proposal error:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// ── GET /api/proposals — Get all proposals for user ───────────
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user!.userId);
    const { type } = req.query; // 'sent' | 'received'

    const where = type === 'sent'
      ? { fromUserId: userId }
      : type === 'received'
        ? { toUserId: userId }
        : { OR: [{ fromUserId: userId }, { toUserId: userId }] };

    const proposals = await prisma.proposal.findMany({
      where,
      include: {
        fromUser: { select: { id: true, name: true, email: true } },
        toUser:   { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, count: proposals.length, proposals });
  } catch (error) {
    console.error('Get proposals error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── PATCH /api/proposals/:id — Accept or Reject ───────────────
router.patch('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body; // 'accepted' | 'rejected' | 'cancelled'
    if (!['accepted', 'rejected', 'cancelled'].includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' });

    const proposal = await prisma.proposal.update({
      where: { id: Number(req.params.id) },
      data:  { status },
      include: {
        fromUser: { select: { id: true, name: true } },
        toUser:   { select: { id: true, name: true } },
      },
    });

    // Notify the sender
    if (status === 'accepted' || status === 'rejected') {
      await prisma.notification.create({
        data: {
          userId:  proposal.fromUserId,
          title:   status === 'accepted' ? '✅ Proposal Accepted!' : '❌ Proposal Rejected',
          message: `${proposal.toUser.name} has ${status} your skill swap proposal.`,
        },
      });
    }

    return res.json({ success: true, message: `Proposal ${status}`, proposal });
  } catch (error) {
    console.error('Update proposal error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
