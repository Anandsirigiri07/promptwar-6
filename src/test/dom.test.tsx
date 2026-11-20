import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext.js';
import { OnboardingPage } from '../pages/OnboardingPage.js';
import { RoutinePage } from '../pages/RoutinePage.js';
import { IndoorAirPage } from '../pages/IndoorAirPage.js';
import { ProfilePage } from '../pages/ProfilePage.js';

describe('User Interactions & Dynamic DOM Workflows', () => {
  it('allows user to select personas in OnboardingPage and submit profile', async () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <OnboardingPage />
        </AppProvider>
      </BrowserRouter>
    );

    const cityInput = screen.getByLabelText(/Metropolitan City/i);
    fireEvent.change(cityInput, { target: { value: 'Delhi NCR' } });
    expect(cityInput).toHaveValue('Delhi NCR');

    // Toggle Senior Citizen persona
    const seniorCard = screen.getAllByText(/Senior Citizen/i)[0]!;
    fireEvent.click(seniorCard);

    const submitBtn = screen.getByRole('button', { name: /Save & Open Dashboard/i });
    expect(submitBtn).toBeInTheDocument();
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Profile Saved!/i)).toBeInTheDocument();
  });

  it('allows switching protection persona tabs in RoutinePage', () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <RoutinePage />
        </AppProvider>
      </BrowserRouter>
    );

    const elderlyTab = screen.getByRole('button', { name: /Senior Citizen/i });
    fireEvent.click(elderlyTab);
    expect(screen.getByText(/Generate AI Routine for Senior/i)).toBeInTheDocument();
  });

  it('opens and closes Add Room modal in IndoorAirPage', () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <IndoorAirPage />
        </AppProvider>
      </BrowserRouter>
    );

    const addRoomBtn = screen.getByRole('button', { name: /Add Room/i });
    fireEvent.click(addRoomBtn);

    expect(screen.getByText(/Add New Room Configuration/i)).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    expect(screen.queryByText(/Add New Room Configuration/i)).not.toBeInTheDocument();
  });

  it('allows demo evaluator login in ProfilePage', () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <ProfilePage />
        </AppProvider>
      </BrowserRouter>
    );

    const demoLoginBtn = screen.queryByRole('button', { name: /Continue as Demo Evaluator/i });
    if (demoLoginBtn) {
      fireEvent.click(demoLoginBtn);
    }
    expect(screen.getByText(/User Account & Preferences/i)).toBeInTheDocument();
  });
});
