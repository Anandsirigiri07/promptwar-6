/**
 * VAYUWISE AI - Meteorological & Inversion Intelligence Provider
 * Analyzes atmospheric lapse rates, boundary layer heights, and nocturnal inversions.
 * Uses Open-Meteo Weather Reanalysis/Forecast (free, no key required), falling back
 * to calibrated offline atmospheric profiles when offline.
 */

import { z } from 'zod';
import { WeatherData, analyzeThermalInversion, InversionAnalysis } from '../../src/lib/compute/meteorology.js';
import { logger } from '../utils/logger.js';

const OpenMeteoWeatherSchema = z.object({
  current: z.object({
    time: z.string(),
    temperature_2m: z.number().nullable().optional(),
    relative_humidity_2m: z.number().nullable().optional(),
    wind_speed_10m: z.number().nullable().optional()
  }).optional(),
  hourly: z.object({
    time: z.array(z.string()),
    boundary_layer_height: z.array(z.number().nullable()).optional(),
    temperature_1000hPa: z.array(z.number().nullable()).optional(),
    temperature_850hPa: z.array(z.number().nullable()).optional()
  }).optional()
});

export class MeteorologyProvider {
  /**
   * Asynchronously retrieves weather data, prioritizing live atmospheric reanalysis.
   */
  public static async getCurrentWeatherAsync(
    _zoneId: string,
    scenario = 'realtime',
    lat = 28.6139,
    lon = 77.2090
  ): Promise<WeatherData> {
    if (scenario !== 'realtime') {
      return this.getCalibratedWeather(scenario);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&hourly=boundary_layer_height,temperature_1000hPa,temperature_850hPa&timezone=auto`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const rawJson = await res.json();
        const parsed = OpenMeteoWeatherSchema.safeParse(rawJson);
        if (parsed.success && parsed.data.current) {
          const c = parsed.data.current;
          const h = parsed.data.hourly;

          const temp = c.temperature_2m ?? 18;
          const humidity = c.relative_humidity_2m ?? 65;
          const wind = c.wind_speed_10m ?? 7.5;

          const blh = h?.boundary_layer_height?.[0] ?? 550;
          const surfaceTemp = h?.temperature_1000hPa?.[0] ?? temp;
          const aloftTemp = h?.temperature_850hPa?.[0] ?? (temp - 3.5);

          return {
            temperatureC: Math.round(temp * 10) / 10,
            humidityPercent: Math.round(humidity),
            windSpeedKmh: Math.round(wind * 10) / 10,
            boundaryLayerHeightMeters: Math.round(blh),
            surfaceTemperatureC: Math.round(surfaceTemp * 10) / 10,
            aloftTemperatureC: Math.round(aloftTemp * 10) / 10
          };
        }
      }
    } catch (err) {
      clearTimeout(timeout);
      logger.warn('Live meteorology provider unreachable, using calibrated atmospheric sounding', {
        error: err instanceof Error ? err.message : String(err)
      });
    }

    return this.getCalibratedWeather(scenario);
  }

  public static getCurrentWeather(_zoneId: string, scenario = 'realtime'): WeatherData {
    return this.getCalibratedWeather(scenario);
  }

  public static async getInversionStatusAsync(
    zoneId: string,
    scenario = 'realtime',
    lat = 28.6139,
    lon = 77.2090
  ): Promise<InversionAnalysis> {
    const weather = await this.getCurrentWeatherAsync(zoneId, scenario, lat, lon);
    return analyzeThermalInversion(weather);
  }

  public static getInversionStatus(zoneId: string, scenario = 'realtime'): InversionAnalysis {
    const weather = this.getCurrentWeather(zoneId, scenario);
    return analyzeThermalInversion(weather);
  }

  private static getCalibratedWeather(scenario: string): WeatherData {
    let temperatureC = 17;
    let humidityPercent = 68;
    let windSpeedKmh = 6.2;
    let surfaceTemp = 16.5;
    let aloftTemp = 18.0;

    if (scenario === 'winter_smog_spike') {
      temperatureC = 12;
      humidityPercent = 85;
      windSpeedKmh = 2.5;
      surfaceTemp = 11.0;
      aloftTemp = 16.5; // Inversion lid
    } else if (scenario === 'inversion_trap') {
      temperatureC = 9;
      humidityPercent = 94;
      windSpeedKmh = 1.0;
      surfaceTemp = 8.5;
      aloftTemp = 17.0; // Strong thermal inversion
    } else if (scenario === 'improved_dispersion') {
      temperatureC = 23;
      humidityPercent = 42;
      windSpeedKmh = 19.0;
      surfaceTemp = 24.0;
      aloftTemp = 19.5; // Normal lapse
    }

    return {
      temperatureC,
      humidityPercent,
      windSpeedKmh,
      boundaryLayerHeightMeters: scenario === 'inversion_trap' ? 220 : 650,
      surfaceTemperatureC: surfaceTemp,
      aloftTemperatureC: aloftTemp
    };
  }
}
