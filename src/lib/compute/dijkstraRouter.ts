/**
 * VAYUWISE AI - Pure Dijkstra Multi-Modal Routing Engine with Exposure Weights
 * Calculates lowest-exposure and lowest-time routes on a transit graph.
 * 
 * Edge cost function:
 * cost = distance * (1 + (ambientAQI / 100) * (1 - protectionFactor))
 */

import { assertFiniteNumber } from './asserts.js';
import { CommuteMode, COMMUTE_PROFILES } from './commuteDose.js';

export interface GraphNode {
  id: string;
  name: string;
  zone: string;
  latitude: number;
  longitude: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  distanceKm: number;
  mode: CommuteMode;
  ambientAQI: number;
}

export interface RouteStep {
  fromNode: string;
  toNode: string;
  distanceKm: number;
  mode: CommuteMode;
  stepDurationMinutes: number;
  ambientAQI: number;
}

export interface PlannedPathResult {
  path: string[];
  totalDistanceKm: number;
  totalDurationMinutes: number;
  estimatedPM25Dose_ug: number;
  co2EmissionsGrams: number;
  steps: RouteStep[];
  strategy: 'lowest_exposure' | 'shortest_distance' | 'fastest_time';
}

export class DijkstraRouter {
  private nodes: Map<string, GraphNode> = new Map();
  private adjacency: Map<string, GraphEdge[]> = new Map();

  public addNode(node: GraphNode): void {
    if (!node.id || node.id.trim() === '') {
      throw new Error('Node must have a valid identifier');
    }
    this.nodes.set(node.id, node);
    if (!this.adjacency.has(node.id)) {
      this.adjacency.set(node.id, []);
    }
  }

  public addEdge(edge: GraphEdge): void {
    assertFiniteNumber(edge.distanceKm, 'Edge distance (km)', 0.01, 1000);
    assertFiniteNumber(edge.ambientAQI, 'Edge ambient AQI', 0, 1000);

    if (!this.nodes.has(edge.from)) {
      throw new Error(`Edge source node ${edge.from} not found in graph`);
    }
    if (!this.nodes.has(edge.to)) {
      throw new Error(`Edge target node ${edge.to} not found in graph`);
    }

    const list = this.adjacency.get(edge.from) || [];
    list.push(edge);
    this.adjacency.set(edge.from, list);
  }

  public findOptimalRoute(
    startNodeId: string,
    endNodeId: string,
    strategy: 'lowest_exposure' | 'shortest_distance' | 'fastest_time' = 'lowest_exposure',
    hasN95 = false
  ): PlannedPathResult {
    if (!this.nodes.has(startNodeId)) {
      throw new Error(`Origin node ${startNodeId} not present in graph`);
    }
    if (!this.nodes.has(endNodeId)) {
      throw new Error(`Destination node ${endNodeId} not present in graph`);
    }

    // Trivial path
    if (startNodeId === endNodeId) {
      return {
        path: [startNodeId],
        totalDistanceKm: 0,
        totalDurationMinutes: 0,
        estimatedPM25Dose_ug: 0,
        co2EmissionsGrams: 0,
        steps: [],
        strategy
      };
    }

    const distances = new Map<string, number>();
    const previous = new Map<string, { node: string; edge: GraphEdge }>();
    const unvisited = new Set<string>();

    for (const nodeId of this.nodes.keys()) {
      distances.set(nodeId, Infinity);
      unvisited.add(nodeId);
    }
    distances.set(startNodeId, 0);

    while (unvisited.size > 0) {
      // Find node with smallest distance
      let current: string | null = null;
      let minDistance = Infinity;

      for (const nodeId of unvisited) {
        const d = distances.get(nodeId)!;
        if (d < minDistance) {
          minDistance = d;
          current = nodeId;
        }
      }

      if (!current || minDistance === Infinity) {
        break; // Unreachable destination
      }

      if (current === endNodeId) {
        break; // Destination reached
      }

      unvisited.delete(current);
      const edges = this.adjacency.get(current) || [];

      for (const edge of edges) {
        if (!unvisited.has(edge.to)) continue;

        // Calculate edge cost based on strategy
        const profile = COMMUTE_PROFILES[edge.mode];
        const speed = profile ? profile.averageSpeedKmh : 20;
        const durationHours = edge.distanceKm / speed;
        const filter = profile ? profile.defaultVehicleFiltration : 0;
        const protection = hasN95 ? Math.max(filter, 0.90) : filter;

        let edgeCost = edge.distanceKm;
        if (strategy === 'lowest_exposure') {
          // Weight incorporates ambient AQI and exposure rate
          edgeCost = edge.distanceKm * (1 + (edge.ambientAQI / 80) * (1 - protection));
        } else if (strategy === 'fastest_time') {
          edgeCost = durationHours * 60; // in minutes
        }

        const alt = distances.get(current)! + edgeCost;
        if (alt < distances.get(edge.to)!) {
          distances.set(edge.to, alt);
          previous.set(edge.to, { node: current, edge });
        }
      }
    }

    // Check if end node was reached
    if (!previous.has(endNodeId)) {
      throw new Error(`No route found between ${startNodeId} and ${endNodeId}`);
    }

    // Reconstruct path
    const path: string[] = [];
    const steps: RouteStep[] = [];
    let curr = endNodeId;

    while (curr !== startNodeId) {
      path.unshift(curr);
      const prevInfo = previous.get(curr);
      if (!prevInfo) break;
      const { node: prevNode, edge } = prevInfo;
      const profile = COMMUTE_PROFILES[edge.mode];
      const speed = profile ? profile.averageSpeedKmh : 20;
      steps.unshift({
        fromNode: prevNode,
        toNode: curr,
        distanceKm: edge.distanceKm,
        mode: edge.mode,
        stepDurationMinutes: Math.round((edge.distanceKm / speed) * 60),
        ambientAQI: edge.ambientAQI
      });
      curr = prevNode;
    }
    path.unshift(startNodeId);

    // Sum totals
    let totalDist = 0;
    let totalMins = 0;
    let totalDose = 0;
    let totalCO2 = 0;

    for (const step of steps) {
      totalDist += step.distanceKm;
      totalMins += step.stepDurationMinutes;
      const profile = COMMUTE_PROFILES[step.mode]!;
      const filter = hasN95 ? Math.max(profile.defaultVehicleFiltration, 0.9) : profile.defaultVehicleFiltration;
      // Inhaled dose approximation from AQI (AQI ~ PM2.5 in ug/m3 approximation for cost)
      const approxPM25 = step.ambientAQI * 0.8;
      const dose = approxPM25 * (step.stepDurationMinutes / 60) * profile.breathingRateM3PerHour * (1 - filter);
      totalDose += dose;
      totalCO2 += step.distanceKm * profile.co2GramsPerPassengerKm;
    }

    return {
      path,
      totalDistanceKm: Math.round(totalDist * 10) / 10,
      totalDurationMinutes: totalMins,
      estimatedPM25Dose_ug: Math.round(totalDose * 10) / 10,
      co2EmissionsGrams: Math.round(totalCO2),
      steps,
      strategy
    };
  }
}
