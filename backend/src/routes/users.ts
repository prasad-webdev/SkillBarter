import express, { Response } from 'express';
import prisma from '../config/db';
import authMiddleware, { AuthRequest } from '../middleware/auth';

const router = express.Router();

// ── GET /api/users  — User Directory (search + filter) ───────
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { search, role } = req.query;

    // SQLite: no mode:'insensitive' — use plain contains
    const users = await prisma.user.findMany({
      where: {
        AND: [
          role ? { role: role as string } : {},
          search
            ? {
                OR: [
                  { name:  { contains: search as string } },
                  { email: { contains: search as string } },
                  {
                    skillsOffered: {
                      some: { skillName: { contains: search as string } },
                    },
                  },
                ],
              }
            : {},
        ],
      },
      select: {
        id: true, name: true, email: true, role: true, bio: true,
        linkedin: true, portfolio: true, createdAt: true,
        skillsOffered: { select: { skillName: true, proficiency: true } },
        skillsWanted:  { select: { skillName: true } },
        availability:  { select: { dayOfWeek: true, preferredTime: true } },
        wallet:        { select: { balance: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/users/:id  — Single user profile ────────────────
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
      select: {
        id: true, name: true, email: true, role: true, bio: true,
        linkedin: true, portfolio: true, createdAt: true,
        skillsOffered: { select: { skillName: true, proficiency: true } },
        skillsWanted:  { select: { skillName: true } },
        availability:  { select: { dayOfWeek: true, preferredTime: true } },
        wallet:        { select: { balance: true } },
      },
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
