import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AqiBadge } from '../components/shared/AqiBadge.js';
import { PollutantSparkline } from '../components/shared/PollutantSparkline.js';
import { UrbanMapSvg } from '../components/shared/UrbanMapSvg.js';
import { AppProvider } from '../context/AppContext.js';
import { Navbar } from '../components/Navigation/Navbar.js';
import { Sidebar } from '../components/Navigation/Sidebar.js';
import { RouteLoadingFallback } from '../components/shared/RouteLoadingFallback.js';
import { RouteErrorBoundary } from '../components/shared/RouteErrorBoundary.js';
import type { UrbanZoneTelemetry } from '../types/telemetry.js';

describe('UI Component Rendering & Accessibility Attributes', () => {
  it('renders AqiBadge with accessible aria-label and numerical status', () => {
    render(<AqiBadge aqi={185} category="Moderate" />);
    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('aria-label', 'Air Quality Index: 185, Category: Moderate');
    expect(screen.getByText('185 AQI')).toBeInTheDocument();
  });

  it('renders an unavailable AQI badge when monitored pollutant coverage is incomplete', () => {
    render(<AqiBadge aqi={185} category="Unavailable" isValid={false} />);
    expect(screen.getByRole('status')).toHaveTextContent('AQI unavailable');
    expect(screen.getByRole('status')).toHaveTextContent('Insufficient data');
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Air Quality Index unavailable because pollutant coverage is incomplete'
    );
  });

  it('renders PollutantSparkline with screen-reader text fallback', () => {
    render(
      <PollutantSparkline
        data={[90, 110, 125, 140, 150]}
        unit="µg/m³"
        pollutantName="Fine PM2.5"
      />
    );
    expect(screen.getByText(/Fine PM2.5 7-hour trend is rising/i)).toBeInTheDocument();
  });

  it('renders UrbanMapSvg with accessible table companion and zone buttons', () => {
    const mockZones: UrbanZoneTelemetry[] = [
      {
        zoneId: 'zone-1',
        name: 'Tech Corridor',
        city: 'Delhi',
        latitude: 28.61,
        longitude: 77.20,
        overallAQI: 165,
        dominantPollutant: 'pm25',
        category: 'Moderate',
        temperatureC: 22,
        humidityPercent: 55,
        windSpeedKmh: 12,
        isInversionActive: false,
        pollutants: {
          pm25: {
            code: 'pm25',
            name: 'PM2.5',
            concentration: 85,
            unit: 'µg/m³',
            subIndex: 165,
            category: 'Moderate',
            healthImplications: 'Moderate health concern',
            hourlyTrend: [70, 75, 80, 85]
          },
          pm10: { code: 'pm10', name: 'PM10', concentration: 120, unit: 'µg/m³', subIndex: 110, category: 'Moderate', healthImplications: 'Moderate', hourlyTrend: [100, 110, 120] },
          no2: { code: 'no2', name: 'NO2', concentration: 40, unit: 'µg/m³', subIndex: 40, category: 'Good', healthImplications: 'Good', hourlyTrend: [35, 40] },
          co: { code: 'co', name: 'CO', concentration: 1.2, unit: 'mg/m³', subIndex: 30, category: 'Good', healthImplications: 'Good', hourlyTrend: [1.1, 1.2] },
          o3: { code: 'o3', name: 'O3', concentration: 35, unit: 'µg/m³', subIndex: 35, category: 'Good', healthImplications: 'Good', hourlyTrend: [30, 35] },
          so2: { code: 'so2', name: 'SO2', concentration: 15, unit: 'µg/m³', subIndex: 15, category: 'Good', healthImplications: 'Good', hourlyTrend: [12, 15] }
        },
        measuredAt: new Date().toISOString(),
        dataProvider: 'CPCB',
        isDemoData: true,
        dataOrigin: 'demo'
      }
    ];

    render(
      <UrbanMapSvg
        zones={mockZones}
        selectedZoneId="zone-1"
        onSelectZone={() => {}}
      />
    );

    const mapGraphic = screen.getByRole('img');
    expect(mapGraphic).toBeInTheDocument();
    expect(screen.getAllByText('Tech Corridor').length).toBeGreaterThan(0);
  });

  it('renders Navbar with brand title and accessible controls', () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <Navbar isSidebarOpen={false} onToggleSidebar={() => {}} />
        </AppProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/VAYUWISE/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Select Language/i)).toBeInTheDocument();
  });

  it('renders Sidebar with full navigation links to all platform pages', () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <Sidebar isOpen={true} onClose={() => {}} />
        </AppProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText(/Air Intelligence/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Daily Routine/i)).toBeInTheDocument();
    expect(screen.getByText(/Transit Optimizer/i)).toBeInTheDocument();
    expect(screen.getByText(/Indoor Quality & DIY/i)).toBeInTheDocument();
  });

  it('labels current-snapshot indexes as indicative instead of official AQI', () => {
    render(<AqiBadge aqi={185} category="Moderate" basis="instantaneous_estimate" />);
    expect(screen.getByRole('status')).toHaveTextContent('185 Indicative AQI');
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Indicative AQI: 185, Category: Moderate');
  });

  it('renders RouteLoadingFallback with accessible role="status" and aria-live="polite"', () => {
    render(<RouteLoadingFallback />);
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText(/Loading Air Intelligence Module/i)).toBeInTheDocument();
  });

  it('renders RouteErrorBoundary with role="alert" and actionable recovery buttons', () => {
    render(
      <BrowserRouter>
        <RouteErrorBoundary error={new Error('Test network interruption')} />
      </BrowserRouter>
    );
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText('Test network interruption')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reload Module/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Return to Dashboard/i })).toBeInTheDocument();
  });
});
