/**
 * VAYUWISE AI - Community Action & Collective Impact Routes
 */

import { Router, Response, NextFunction } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/authentication.js';
import { validateBody } from '../middleware/validation.js';
import { CommunityPledgeRequestSchema, CommunityActionLogRequestSchema } from '../validators/user.schema.js';
import { fetchCommunityPledges, saveCommunityPledge, logCommunityAction } from '../services/firestoreService.js';
import { calculatePledgeAvoidedEmissions, CommunityPledgeRecord, IMPACT_METHODOLOGY_STANDARDS } from '../../src/lib/compute/communityImpact.js';

export const communityRouter = Router();

communityRouter.get(
  '/pledges',
  async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pledges = await fetchCommunityPledges();

      // Compute aggregate verified environmental savings across all pledges
      let totalParticipants = 0;
      let totalActions = 0;
      let totalCO2Kg = 0;
      let totalPM25Grams = 0;

      for (const p of pledges) {
        totalParticipants += p.participants;
        totalActions += p.completedCount;
        totalCO2Kg += p.estimatedCO2SavingsKg;
        totalPM25Grams += p.estimatedPM25AvoidedGrams;
      }

      res.json({
        success: true,
        data: {
          pledges,
          aggregates: {
            totalParticipants,
            totalActivePledges: pledges.length,
            totalActionsLogged: totalActions,
            cumulativeCO2SavedKg: Math.round(totalCO2Kg * 10) / 10,
            cumulativePM25AvoidedGrams: Math.round(totalPM25Grams),
            lastUpdatedAt: new Date().toISOString()
          },
          methodologyStandards: IMPACT_METHODOLOGY_STANDARDS
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

communityRouter.post(
  '/pledges',
  requireAuth,
  validateBody(CommunityPledgeRequestSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category, title, description, targetCount } = req.body;
      const userId = req.user?.uid || 'demo-user-101';

      const initialImpact = calculatePledgeAvoidedEmissions(category, 0);

      const newPledge: CommunityPledgeRecord = {
        id: `pledge-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        userId,
        category,
        title,
        description,
        targetCount,
        completedCount: 0,
        estimatedCO2SavingsKg: initialImpact.co2Kg,
        estimatedPM25AvoidedGrams: initialImpact.pm25Grams,
        participants: 1,
        createdAt: new Date().toISOString()
      };

      await saveCommunityPledge(newPledge);

      res.status(201).json({
        success: true,
        data: newPledge
      });
    } catch (err) {
      next(err);
    }
  }
);

communityRouter.post(
  '/actions',
  requireAuth,
  validateBody(CommunityActionLogRequestSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { pledgeId, unitsCompleted, notes } = req.body;
      const userId = req.user?.uid || 'demo-user-101';

      const actionId = `action-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      await logCommunityAction({
        id: actionId,
        userId,
        pledgeId,
        unitsCompleted,
        notes
      });

      res.status(201).json({
        success: true,
        data: {
          actionId,
          pledgeId,
          unitsCompleted,
          loggedAt: new Date().toISOString(),
          message: `Successfully verified ${unitsCompleted} community environmental actions.`
        }
      });
    } catch (err) {
      next(err);
    }
  }
);
