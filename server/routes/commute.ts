/**
 * VAYUWISE AI - Commute Optimization & Dijkstra Routing Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { validateBody } from '../middleware/validation.js';
import { CommuteCompareRequestSchema } from '../validators/user.schema.js';
import { calculateCommuteDose, CommuteMode, CommuteDoseOutput } from '../../src/lib/compute/commuteDose.js';
import { DijkstraRouter, GraphNode, GraphEdge } from '../../src/lib/compute/dijkstraRouter.js';

export const commuteRouter = Router();

// Build demo urban road network for Dijkstra shortest & lowest exposure path
function createUrbanTransitGraph(ambientAQI: number): DijkstraRouter {
  const router = new DijkstraRouter();

  const nodes: GraphNode[] = [
    { id: 'node-home', name: 'Residential Colony (Indiranagar)', zone: 'zone-3', latitude: 28.55, longitude: 77.18 },
    { id: 'node-metro-a', name: 'Indiranagar Metro Station', zone: 'zone-3', latitude: 28.56, longitude: 77.19 },
    { id: 'node-arterial', name: 'Inner Ring Road Congestion Hub', zone: 'zone-5', latitude: 28.60, longitude: 77.22 },
    { id: 'node-metro-b', name: 'Tech Park Metro Station', zone: 'zone-1', latitude: 28.62, longitude: 77.21 },
    { id: 'node-office', name: 'Corporate Cyber Park', zone: 'zone-1', latitude: 28.63, longitude: 77.23 },
    { id: 'node-backroad', name: 'Residential Green Corridor / Boulevard', zone: 'zone-4', latitude: 28.57, longitude: 77.16 }
  ];

  for (const n of nodes) router.addNode(n);

  const edges: GraphEdge[] = [
    // Direct arterial road route (heavy diesel traffic & smog)
    { from: 'node-home', to: 'node-arterial', distanceKm: 4.2, mode: 'petrol_car', ambientAQI: ambientAQI * 1.3 },
    { from: 'node-arterial', to: 'node-office', distanceKm: 5.8, mode: 'petrol_car', ambientAQI: ambientAQI * 1.4 },
    // Metro transit path (walk to metro -> fast electric train -> walk to office)
    { from: 'node-home', to: 'node-metro-a', distanceKm: 0.8, mode: 'walking', ambientAQI },
    { from: 'node-metro-a', to: 'node-metro-b', distanceKm: 8.5, mode: 'metro', ambientAQI: ambientAQI * 0.4 },
    { from: 'node-metro-b', to: 'node-office', distanceKm: 0.6, mode: 'walking', ambientAQI },
    // Backroad bicycle / green corridor route
    { from: 'node-home', to: 'node-backroad', distanceKm: 2.1, mode: 'cycling', ambientAQI: ambientAQI * 0.8 },
    { from: 'node-backroad', to: 'node-office', distanceKm: 7.2, mode: 'cycling', ambientAQI: ambientAQI * 0.85 },
    // Electric bus along arterial
    { from: 'node-home', to: 'node-arterial', distanceKm: 4.2, mode: 'electric_bus', ambientAQI: ambientAQI * 1.1 },
    { from: 'node-arterial', to: 'node-office', distanceKm: 5.8, mode: 'electric_bus', ambientAQI: ambientAQI * 1.1 }
  ];

  for (const e of edges) router.addEdge(e);

  return router;
}

commuteRouter.post(
  '/compare',
  validateBody(CommuteCompareRequestSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { origin, destination, distanceKm, ambientPM25, hasN95Mask } = req.body;
      const modes: CommuteMode[] = ['metro', 'electric_bus', 'diesel_bus', 'ev_car', 'petrol_car', 'cycling', 'walking'];

      const comparisons: CommuteDoseOutput[] = modes.map(mode =>
        calculateCommuteDose({
          mode,
          distanceKm,
          ambientPM25_ugm3: ambientPM25,
          hasN95Mask
        })
      );

      // Run Dijkstra path routing
      const graph = createUrbanTransitGraph(ambientPM25);
      const lowestExposureRoute = graph.findOptimalRoute('node-home', 'node-office', 'lowest_exposure', hasN95Mask);
      const shortestRoute = graph.findOptimalRoute('node-home', 'node-office', 'shortest_distance', hasN95Mask);

      // Select recommended mode
      const recommended = comparisons.find(c => c.mode === 'metro') || comparisons[0]!;

      res.json({
        success: true,
        data: {
          origin,
          destination,
          distanceKm,
          ambientPM25,
          hasN95Mask,
          comparisons,
          recommendedMode: recommended.mode,
          dijkstraExposureOptimized: lowestExposureRoute,
          dijkstraShortestDistance: shortestRoute,
          tradeoffSummary: `Taking the Metro lowers inhaled PM2.5 dose by ${
            Math.round((1 - (recommended.inhaledDose_ug / (comparisons.find(c => c.mode === 'cycling')?.inhaledDose_ug || 1))) * 100)
          }% compared to cycling, while eliminating 100% of direct tailpipe carbon emissions.`
        }
      });
    } catch (err) {
      next(err);
    }
  }
);
