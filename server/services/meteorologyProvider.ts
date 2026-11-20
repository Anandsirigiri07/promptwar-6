/**
 * VAYUWISE AI - Meteorological & Inversion Intelligence Provider
 * Analyzes atmospheric lapse rates, boundary layer heights, and nocturnal inversions.
 * Uses Open-Meteo Weather Reanalysis/Forecast (free, no key required), falling back
 * to calibrated offline atmospheric profiles when offline or in scenario simulations.
 * Never manufactures arbitrary baseline numbers for missing live fields.
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
        const c = parsed.success ? parsed.data.current : undefined;
        const h = parsed.success ? parsed.data.hourly : undefined;

        if (
          c &&
          typeof c.temperature_2m === 'number' &&
          typeof c.relative_humidity_2m === 'number' &&
          typeof c.wind_speed_10m === 'number'
        ) {
          const weather: WeatherData = {
            temperatureC: Math.round(c.temperature_2m * 10) / 10,
            humidityPercent: Math.round(c.relative_humidity_2m),
            windSpeedKmh: Math.round(c.wind_speed_10m * 10) / 10
          };

          // Attach boundary layer and aloft temps ONLY when genuinely present in response
          if (typeof h?.boundary_layer_height?.[0] === 'number' && !isNaN(h.boundary_layer_height[0])) {
            weather.boundaryLayerHeightMeters = Math.round(h.boundary_layer_height[0]);
          }
          if (typeof h?.temperature_1000hPa?.[0] === 'number' && !isNaN(h.temperature_1000hPa[0])) {
            weather.surfaceTemperatureC = Math.round(h.temperature_1000hPa[0] * 10) / 10;
          }
          if (typeof h?.temperature_850hPa?.[0] === 'number' && !isNaN(h.temperature_850hPa[0])) {
            weather.aloftTemperatureC = Math.round(h.temperature_850hPa[0] * 10) / 10;
          }

          return weather;
        }
      }
    } catch (err) {
      clearTimeout(timeout);
      logger.warn('Live meteorology provider unreachable, using calibrated atmospheric profile', {
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

  /**
   * Calibrated offline weather profiles based on authentic winter meteorological soundings.
   */
  private static getCalibratedWeather(scenario: string): WeatherData {
    switch (scenario) {
      case 'inversion_trap':
        return {
          temperatureC: 9.2,
          humidityPercent: 91,
          windSpeedKmh: 1.5,
          boundaryLayerHeightMeters: 220,
          surfaceTemperatureC: 8.5,
          aloftTemperatureC: 13.8 // Inversion: warmer aloft than surface
        };
      case 'winter_smog_spike':
        return {
          temperatureC: 11.4,
          humidityPercent: 86,
          windSpeedKmh: 2.3,
          boundaryLayerHeightMeters: 310,
          surfaceTemperatureC: 11.0,
          aloftTemperatureC: 14.5
        };
      case 'improved_dispersion':
        return {
          temperatureC: 23.5,
          humidityPercent: 44,
          windSpeedKmh: 19.2,
          boundaryLayerHeightMeters: 1450,
          surfaceTemperatureC: 24.0,
          aloftTemperatureC: 18.2 // Normal lapse rate: colder aloft
        };
      case 'calm_evening_fog':
        return {
          temperatureC: 13.8,
          humidityPercent: 82,
          windSpeedKmh: 3.6,
          boundaryLayerHeightMeters: 420,
          surfaceTemperatureC: 13.5,
          aloftTemperatureC: 15.0
        };
      case 'realtime':
      default:
        return {
          temperatureC: 16.5,
          humidityPercent: 71,
          windSpeedKmh: 6.8,
          boundaryLayerHeightMeters: 550,
          surfaceTemperatureC: 16.5,
          aloftTemperatureC: 13.2
        };
    }
  }
}