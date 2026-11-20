import { describe, it, expect } from 'vitest';
import { DijkstraRouter, GraphNode } from '../lib/compute/dijkstraRouter.js';

describe('Pure Dijkstra Multi-Modal Routing Engine', () => {
  function buildTestGraph(): DijkstraRouter {
    const router = new DijkstraRouter();

    const nodes: GraphNode[] = [
      { id: 'A', name: 'Home', zone: 'z1', latitude: 28.5, longitude: 77.2 },
      { id: 'B', name: 'Station A', zone: 'z1', latitude: 28.51, longitude: 77.21 },
      { id: 'C', name: 'Station B', zone: 'z2', latitude: 28.55, longitude: 77.25 },
      { id: 'D', name: 'Office', zone: 'z2', latitude: 28.56, longitude: 77.26 },
      { id: 'E', name: 'Congestion Highway', zone: 'z3', latitude: 28.53, longitude: 77.23 },
      { id: 'ISLAND', name: 'Disconnected Island', zone: 'z4', latitude: 28.9, longitude: 77.9 }
    ];

    for (const n of nodes) router.addNode(n);

    // Path 1: Walk to metro, fast filtered metro, walk to office (Total: 0.5 + 8 + 0.5 = 9km, low exposure)
    router.addEdge({ from: 'A', to: 'B', distanceKm: 0.5, mode: 'walking', ambientPM25: 150 });
    router.addEdge({ from: 'B', to: 'C', distanceKm: 8.0, mode: 'metro', ambientPM25: 60 });
    router.addEdge({ from: 'C', to: 'D', distanceKm: 0.5, mode: 'walking', ambientPM25: 150 });

    // Path 2: Direct congested highway in car (Total: 4 + 4 = 8km, shorter distance but high exposure)
    router.addEdge({ from: 'A', to: 'E', distanceKm: 4.0, mode: 'petrol_car', ambientPM25: 280 });
    router.addEdge({ from: 'E', to: 'D', distanceKm: 4.0, mode: 'petrol_car', ambientPM25: 280 });

    return router;
  }

  it('finds lowest exposure route prioritizing filtered metro over shorter high-pollution road', () => {
    const graph = buildTestGraph();
    const route = graph.findOptimalRoute('A', 'D', 'lowest_exposure', false);

    expect(route.path).toEqual(['A', 'B', 'C', 'D']);
    expect(route.totalDistanceKm).toBe(9);
    expect(route.steps.length).toBe(3);
    expect(route.estimatedPM25Dose_ug).toBeGreaterThan(0);
  });

  it('finds shortest distance route when explicitly configured', () => {
    const graph = buildTestGraph();
    const route = graph.findOptimalRoute('A', 'D', 'shortest_distance', false);

    expect(route.path).toEqual(['A', 'E', 'D']);
    expect(route.totalDistanceKm).toBe(8);
  });

  it('handles trivial path when origin equals destination', () => {
    const graph = buildTestGraph();
    const route = graph.findOptimalRoute('A', 'A', 'lowest_exposure');

    expect(route.path).toEqual(['A']);
    expect(route.totalDistanceKm).toBe(0);
    expect(route.totalDurationMinutes).toBe(0);
    expect(route.estimatedPM25Dose_ug).toBe(0);
  });

  it('throws descriptive error on disconnected graph destination', () => {
    const graph = buildTestGraph();
    expect(() => graph.findOptimalRoute('A', 'ISLAND')).toThrow(/No route found between A and ISLAND/);
  });

  it('throws when querying non-existent nodes', () => {
    const graph = buildTestGraph();
    expect(() => graph.findOptimalRoute('NON_EXISTENT', 'D')).toThrow(/Origin node NON_EXISTENT not present/);
    expect(() => graph.findOptimalRoute('A', 'NON_EXISTENT')).toThrow(/Destination node NON_EXISTENT not present/);
  });

  it('attenuates inhaled dose when N95 respirator is engaged', () => {
    const graph = buildTestGraph();
    const unmasked = graph.findOptimalRoute('A', 'D', 'lowest_exposure', false);
    const masked = graph.findOptimalRoute('A', 'D', 'lowest_exposure', true);

    expect(masked.estimatedPM25Dose_ug).toBeLessThan(unmasked.estimatedPM25Dose_ug);
  });
});
