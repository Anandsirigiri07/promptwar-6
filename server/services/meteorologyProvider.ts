/**
 * VAYUWISE AI - Meteorological & Inversion Intelligence Provider
 * Analyzes atmospheric lapse rates, boundary layer heights, and nocturnal inversions.
 * Uses Open-Meteo modelled weather for realtime data and calibrated atmospheric profiles
 * only when an explicit offline scenario is selected. Live failures remain unavailable.
 */

import { z } from 'zod';
import { WeatherData, analyzeThermalInversion, InversionAnalysis } from '../../src/lib/compute/meteorology.js';

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
   * Fetches genuine live meteorology for exact geospatial coordinates.
   * Returns null if unreachable, preserving authentic telemetry without fabricated numbers.
   */
  public static async fetchLiveWeatherForCoordinatesAsync(
    lat: number,
    lon: number
  ): Promise<{ weather: WeatherData; isInversionActive: boolean | null; measuredAt: string } | null> {
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&hourly=boundary_layer_height,temperature_1000hPa,temperature_850hPa&timezone=auto`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) return null;

      const rawJson = await res.json();
      const parsed = OpenMeteoWeatherSchema.safeParse(rawJson);
      const c = parsed.success ? parsed.data.current : undefined;
      const h = parsed.success ? parsed.data.hourly : undefined;

      if (
        c &&
        typeof c.temperature_2m === 'number' && !isNaN(c.temperature_2m) &&
        typeof c.relative_humidity_2m === 'number' && !isNaN(c.relative_humidity_2m) &&
        typeof c.wind_speed_10m === 'number' && !isNaN(c.wind_speed_10m)
      ) {
        const weather: WeatherData = {
          temperatureC: Math.round(c.temperature_2m * 10) / 10,
          humidityPercent: Math.round(c.relative_humidity_2m),
          windSpeedKmh: Math.round(c.wind_speed_10m * 10) / 10
        };

        // Hourly pressure-level values must align with the provider's current timestamp,
        // not the first hour of the day (which can be many hours stale).
        const currentHourIndex = h?.time.findIndex(hour => hour === c.time) ?? -1;
        const hourlyValue = (values?: Array<number | null>) =>
          currentHourIndex >= 0 ? values?.[currentHourIndex] : null;
        const boundaryLayer = hourlyValue(h?.boundary_layer_height);
        const surfaceAt1000 = hourlyValue(h?.temperature_1000hPa);
        const aloftAt850 = hourlyValue(h?.temperature_850hPa);

        if (typeof boundaryLayer === 'number' && Number.isFinite(boundaryLayer)) {
          weather.boundaryLayerHeightMeters = Math.round(boundaryLayer);
        }
        const has1000hPa = typeof surfaceAt1000 === 'number' && Number.isFinite(surfaceAt1000);
        const has850hPa = typeof aloftAt850 === 'number' && Number.isFinite(aloftAt850);
        if (has1000hPa) weather.surfaceTemperatureC = Math.round(surfaceAt1000 * 10) / 10;
        if (has850hPa) weather.aloftTemperatureC = Math.round(aloftAt850 * 10) / 10;

        // An inversion classification needs both pressure-level temperatures for the current hour.
        let isInversionActive: boolean | null = null;
        if (has1000hPa && has850hPa) {
          isInversionActive = analyzeThermalInversion(weather).isInversionPresent;
        }

        return {
          weather,
          isInversionActive,
          measuredAt: c.time
        };
      }
      return null;
    } catch {
      clearTimeout(timeout);
      return null;
    }
  }

  /**
   * Asynchronously retrieves weather data, prioritizing live atmospheric reanalysis.
   */
  public static async getCurrentWeatherAsync(
    _zoneId: string,
    scenario = 'realtime',
    lat = Number.NaN,
    lon = Number.NaN
  ): Promise<WeatherData | null> {
    if (scenario !== 'realtime') return this.getCalibratedWeather(scenario);
    const live = await this.fetchLiveWeatherForCoordinatesAsync(lat, lon);
    return live?.weather ?? null;
  }

  public static getCurrentWeather(_zoneId: string, scenario = 'realtime'): WeatherData | null {
    return scenario === 'realtime' ? null : this.getCalibratedWeather(scenario);
  }

  public static async getInversionStatusAsync(
    zoneId: string,
    scenario = 'realtime',
    lat = Number.NaN,
    lon = Number.NaN
  ): Promise<InversionAnalysis | null> {
    const weather = await this.getCurrentWeatherAsync(zoneId, scenario, lat, lon);
    return weather ? analyzeThermalInversion(weather) : null;
  }

  public static getInversionStatus(zoneId: string, scenario = 'realtime'): InversionAnalysis | null {
    const weather = this.getCurrentWeather(zoneId, scenario);
    return weather ? analyzeThermalInversion(weather) : null;
  }

  /**
   * Calibrated synthetic weather profiles for explicitly selected offline scenarios.
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