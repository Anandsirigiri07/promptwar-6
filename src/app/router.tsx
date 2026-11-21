/**
 * VAYUWISE AI - Application Router Configuration
 * Implements route-level code splitting with React.lazy and error isolation.
 */

import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from './AppShell.js';
import { RouteErrorBoundary } from '../components/shared/RouteErrorBoundary.js';

// Lazy-loaded page components for route-based micro-chunking
const LandingPage = React.lazy(() => import('../pages/LandingPage.js').then(m => ({ default: m.LandingPage })));
const OnboardingPage = React.lazy(() => import('../pages/OnboardingPage.js').then(m => ({ default: m.OnboardingPage })));
const DashboardPage = React.lazy(() => import('../pages/DashboardPage.js').then(m => ({ default: m.DashboardPage })));
const RoutinePage = React.lazy(() => import('../pages/RoutinePage.js').then(m => ({ default: m.RoutinePage })));
const CommutePage = React.lazy(() => import('../pages/CommutePage.js').then(m => ({ default: m.CommutePage })));
const IndoorAirPage = React.lazy(() => import('../pages/IndoorAirPage.js').then(m => ({ default: m.IndoorAirPage })));
const CommunityPage = React.lazy(() => import('../pages/CommunityPage.js').then(m => ({ default: m.CommunityPage })));
const AdvisoriesPage = React.lazy(() => import('../pages/AdvisoriesPage.js').then(m => ({ default: m.AdvisoriesPage })));
const ProfilePage = React.lazy(() => import('../pages/ProfilePage.js').then(m => ({ default: m.ProfilePage })));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'onboarding', element: <OnboardingPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'routine', element: <RoutinePage /> },
      { path: 'commute', element: <CommutePage /> },
      { path: 'indoor-air', element: <IndoorAirPage /> },
      { path: 'community', element: <CommunityPage /> },
      { path: 'advisories', element: <AdvisoriesPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: '*', element: <LandingPage /> }
    ]
  }
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
