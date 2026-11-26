import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/db';
import authMiddleware, { AuthRequest } from '../middleware/auth';

const router = express.Router();

// ── POST /api/skills/profile  — Save skill profile ───────────
router.post(
  '/profile',
  authMiddleware,
  [
    body('bio').optional().isLength({ min: 20, max: 500 })
      .withMessage('Bio must be between 20 and 500 characters'),
    body('skillsOffered').isArray({ min: 1 })
      .withMessage('Please add at least 1 skill you can offer'),
    body('skillsWanted').isArray({ min: 1 })
      .withMessage('Please add at least 1 skill you want to learn'),
    body('proficiency')
      .isIn(['Beginner', 'Intermediate', 'Advanced', 'Expert'])
      .withMessage('Invalid proficiency level'),
    body('availableDays').isArray({ min: 1 })
      .withMessage('Please select at least 1 available day'),
    body('preferredTime').notEmpty()
      .withMessage('Please select a preferred time slot'),
    body('hourlyRate').optional().isInt({ min: 0 })
      .withMessage('Credits must be a positive number'),
    body('linkedin').optional()
      .matches(/^(https?:\/\/(www\.)?linkedin\.com\/in\/.+)?$/)
      .withMessage('Enter a valid LinkedIn URL'),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const userId = Number(req.user!.userId);
      const {
        bio, skillsOffered, skillsWanted, proficiency,
        availableDays, preferredTime, linkedin, portfolio,
      } = req.body;

      await prisma.$transaction(async (tx) => {
        // Update user bio & links
        await tx.user.update({
          where: { id: userId },
          data:  { bio, linkedin, portfolio },
        });

        // Replace skills offered (delete all first, then insert fresh)
        await tx.skillOffered.deleteMany({ where: { userId } });
        await tx.skillOffered.createMany({
          data: (skillsOffered as string[]).map((skillName: string) => ({
            userId, skillName, proficiency,
          })),
        });

        // Replace skills wanted
        await tx.skillWanted.deleteMany({ where: { userId } });
        await tx.skillWanted.createMany({
          data: (skillsWanted as string[]).map((skillName: string) => ({
            userId, skillName,
          })),
        });

        // Replace availability
        await tx.availability.deleteMany({ where: { userId } });
        await tx.availability.createMany({
          data: (availableDays as string[]).map((dayOfWeek: string) => ({
            userId, dayOfWeek, preferredTime,
          })),
        });
      });

      return res.json({ success: true, message: 'Skill profile saved successfully ✅' });
    } catch (error) {
      console.error('Save skill profile error:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

export default router;
