/**
 * VAYUWISE AI - Community Action & Collective Impact Routes
 * Strictly enforces pledge existence, user authorization, idempotency deduplication,
 * reasonable unit bounds, and accurate self-reported status labeling.
 */

import { Router, Response, NextFunction } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/authentication.js';
import { validateBody } from '../middleware/validation.js';
import { CommunityPledgeRequestSchema, CommunityActionLogRequestSchema } from '../validators/user.schema.js';
import { fetchCommunityPledges, saveCommunityPledge, logCommunityAction, getCommunityPledgeById } from '../services/firestoreService.js';
import { calculatePledgeAvoidedEmissions, CommunityPledgeRecord, IMPACT_METHODOLOGY_STANDARDS } from '../../src/lib/compute/communityImpact.js';

export const communityRouter = Router();

// Idempotency deduplication cache: `${userId}:${pledgeId}:${units}` -> timestamp
const idempotencyCache = new Map<string, number>();

communityRouter.get(
  '/pledges',
  async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { pledges, isDemoData } = await fetchCommunityPledges();

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
          isDemoData,
          dataOrigin: isDemoData ? 'seeded_showcase_demo' : 'firestore_production',
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
      const userId = req.user?.uid || 'anonymous-user';

      // Pledges start with 0 completed units and 0 actual savings
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
      const userId = req.user?.uid || 'anonymous-user';

      // 1. Verify that target pledge exists
      const targetPledge = await getCommunityPledgeById(pledgeId);
      if (!targetPledge) {
        res.status(404).json({
          success: false,
          error: `Target community pledge '${pledgeId}' does not exist. Actions must reference a valid pledge.`
        });
        return;
      }

      // 2. Enforce reasonable per-action unit limits based on category
      const maxUnitsByCategory: Record<string, number> = {
        carpool: 80, // Max 80 km per single carpool trip
        transit: 100, // Max 100 km per transit ride
        anti_burn: 10, // Max 10 fire reports / compost audits per day
        clean_energy: 24, // Max 24 hours solar / clean runtime per day
        green_neighborhood: 20
      };

      const maxAllowed = maxUnitsByCategory[targetPledge.category] || 50;
      if (unitsCompleted > maxAllowed) {
        res.status(400).json({
          success: false,
          error: `Unreasonable quantity: maximum allowed units for category '${targetPledge.category}' is ${maxAllowed} per action log.`
        });
        return;
      }

      // 3. Durable Idempotency / Duplicate submission check
      const clientKey = (req.headers['x-idempotency-key'] as string) ||
                        (req.headers['idempotency-key'] as string) ||
                        (req.body as any).idempotencyKey;
      const idempotencyKey = clientKey || `${userId}:${pledgeId}:${unitsCompleted}`;
      const lastLoggedAt = idempotencyCache.get(idempotencyKey);
      const now = Date.now();

      if (lastLoggedAt && now - lastLoggedAt < 3000) {
        res.status(409).json({
          success: false,
          error: 'Duplicate action submission detected within 3 seconds. Please wait before submitting again.'
        });
        return;
      }
      idempotencyCache.set(idempotencyKey, now);

      // Clean old cache entries
      if (idempotencyCache.size > 1000) {
        for (const [k, time] of idempotencyCache.entries()) {
          if (now - time > 60000) idempotencyCache.delete(k);
        }
      }

      const actionId = `action-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const result = await logCommunityAction({
        id: actionId,
        userId,
        pledgeId,
        unitsCompleted,
        notes,
        idempotencyKey
      });

      if (!result) {
        res.status(404).json({
          success: false,
          error: 'Failed to record action: Target pledge could not be updated.'
        });
        return;
      }

      const statusCode = result.isDuplicate ? 200 : 201;

      res.status(statusCode).json({
        success: true,
        data: {
          actionId: result.actionId,
          pledgeId,
          unitsCompleted,
          status: result.status,
          updatedPledge: result.updatedPledge,
          isDuplicate: result.isDuplicate ?? false,
          loggedAt: new Date().toISOString(),
          message: result.isDuplicate
            ? `Idempotent replay: action previously processed without re-incrementing totals.`
            : `Successfully logged ${unitsCompleted} self-reported community environmental action(s).`
        }
      });
    } catch (err) {
      next(err);
    }
  }
);
