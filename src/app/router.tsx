/**
 * VAYUWISE AI - Application Router Configuration
 * Strictly implements separate, distinct routes for each functional module.
 */

import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from './AppShell.js';

// Page components
import { LandingPage } from '../pages/LandingPage.js';
import { OnboardingPage } from '../pages/OnboardingPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { RoutinePage } from '../pages/RoutinePage.js';
import { CommutePage } from '../pages/CommutePage.js';
import { IndoorAirPage } from '../pages/IndoorAirPage.js';
import { CommunityPage } from '../pages/CommunityPage.js';
import { AdvisoriesPage } from '../pages/AdvisoriesPage.js';
import { ProfilePage } from '../pages/ProfilePage.js';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
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
