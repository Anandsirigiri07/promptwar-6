import { describe, it, expect } from 'vitest';
import { calculateRoomIAQ, CORSI_ROSENTHAL_REFERENCE } from '../lib/compute/cadrCalculations.js';

describe('IAQ, Clean Air Delivery Rate (CADR) & Decay Clearance', () => {
  it('calculates physical room volume and required CADR accurately', () => {
    const res = calculateRoomIAQ({
      name: 'Nursery',
      lengthM: 4.0,
      widthM: 3.0,
      heightM: 2.5,
      targetACH: 5.0,
      currentPurifierCADR_m3h: 0
    });

    expect(res.floorAreaM2).toBe(12);
    expect(res.roomVolumeM3).toBe(30);
    expect(res.requiredCADR_m3h).toBe(150); // 30m3 * 5 ACH = 150 m3/h
    expect(res.actualACH).toBe(0);
    expect(res.status).toBe('Deficient');
    expect(res.diyCorsiRosenthalRecommended).toBe(true);
  });

  it('evaluates adequate status when current CADR exceeds requirement', () => {
    const res = calculateRoomIAQ({
      name: 'Purified Living Room',
      lengthM: 5.0,
      widthM: 4.0,
      heightM: 3.0,
      targetACH: 5.0, // Volume = 60m3 => Required = 300 m3/h
      currentPurifierCADR_m3h: 360
    });

    expect(res.actualACH).toBe(6);
    expect(res.cadrDeficit_m3h).toBe(0);
    expect(res.status).toBe('Optimal');
    expect(res.diyCorsiRosenthalRecommended).toBe(false);
  });

  it('models first-order particle decay clearance times accurately', () => {
    const res = calculateRoomIAQ({
      name: 'Master Bed',
      lengthM: 4.0,
      widthM: 4.0,
      heightM: 3.0, // 48 m3
      targetACH: 5.0,
      currentPurifierCADR_m3h: 240 // 5.0 ACH
    });

    // Effective ACH = 5.0 + 0.3 = 5.3
    // t_80% = (1.6094 / 5.3) * 60 ~= 18 mins
    expect(res.clearanceTime80PercentMinutes).toBeGreaterThan(15);
    expect(res.clearanceTime80PercentMinutes).toBeLessThan(25);
    expect(res.clearanceTime95PercentMinutes).toBeGreaterThan(res.clearanceTime80PercentMinutes);
  });

  it('validates Corsi-Rosenthal reference specifications', () => {
    expect(CORSI_ROSENTHAL_REFERENCE.estimatedCADR_m3h).toBeGreaterThan(500);
    expect(CORSI_ROSENTHAL_REFERENCE.filterCount).toBe(4);
    expect(CORSI_ROSENTHAL_REFERENCE.fanSizeInches).toBe(20);
  });
});
