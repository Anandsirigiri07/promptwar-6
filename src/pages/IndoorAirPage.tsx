/**
 * VAYUWISE AI - Indoor Air Quality & Corsi-Rosenthal Hub (Route: /indoor-air)
 */

import React, { useState } from 'react';
import {
  Home,
  Plus,
  Trash2,
  Wrench,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { calculateRoomIAQ } from '../lib/compute/cadrCalculations.js';
import { evaluateVentilationWindow, type VentilationWindowAdvice } from '../lib/compute/meteorology.js';
import { SavedRoomConfig } from '../types/iaq.js';

export const IndoorAirPage: React.FC = () => {
  const { savedRooms, addSavedRoom, removeSavedRoom, selectedZone } = useApp();

  const [activeRoomId, setActiveRoomId] = useState<string>(savedRooms[0]?.id || 'room-master-bed');
  const [showAddModal, setShowAddModal] = useState(false);

  // New room form state
  const [newRoomName, setNewRoomName] = useState('');
  const [newLength, setNewLength] = useState(4.0);
  const [newWidth, setNewWidth] = useState(3.5);
  const [newHeight, setNewHeight] = useState(2.8);
  const [newCADR, setNewCADR] = useState(200);

  const activeRoom = savedRooms.find((r) => r.id === activeRoomId) || savedRooms[0];

  const iaqMetrics = activeRoom
    ? calculateRoomIAQ({
        name: activeRoom.name,
        lengthM: activeRoom.lengthM,
        widthM: activeRoom.widthM,
        heightM: activeRoom.heightM,
        occupants: activeRoom.occupants,
        currentPurifierCADR_m3h: activeRoom.purifierCADR,
        targetACH: activeRoom.targetACH
      })
    : null;

  // Real-time ventilation advisory: strictly requires verified environmental telemetry (never hardcoded defaults)
  const zone = selectedZone;
  const hasValidWeather = Boolean(
    zone &&
    typeof zone.temperatureC === 'number' &&
    typeof zone.humidityPercent === 'number' &&
    typeof zone.windSpeedKmh === 'number' &&
    typeof zone.overallAQI === 'number'
  );

  const ventilationAdvice: VentilationWindowAdvice = hasValidWeather && zone && zone.temperatureC !== null && zone.humidityPercent !== null && zone.windSpeedKmh !== null
    ? evaluateVentilationWindow(zone.overallAQI, {
        temperatureC: zone.temperatureC,
        humidityPercent: zone.humidityPercent,
        windSpeedKmh: zone.windSpeedKmh
      })
    : {
        action: 'Keep Windows Closed',
        recommendedHoursDescription: 'Insufficient local meteorological observations. Keep windows closed as a precautionary measure during winter smog periods.',
        reason: 'Ventilation evaluation requires verified outdoor AQI and meteorological readings (temperature, humidity, and wind speed). Do not open windows based on unmeasured assumptions.',
        ambientAQI: zone?.overallAQI ?? 0,
        confidenceScore: 0
      };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    const newRoom: SavedRoomConfig = {
      id: `room-${Date.now()}`,
      name: newRoomName.trim(),
      lengthM: newLength,
      widthM: newWidth,
      heightM: newHeight,
      occupants: 2,
      purifierCADR: newCADR,
      targetACH: 5.0
    };

    addSavedRoom(newRoom);
    setActiveRoomId(newRoom.id);
    setShowAddModal(false);
    setNewRoomName('');
  };

  return (
    <div className="space-y-8 py-2 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-2 pb-2 border-b border-sage-200">
        <div className="flex items-center gap-2">
          <Home className="w-7 h-7 text-sage-600" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-forest-900 tracking-tight">
            Indoor Air Quality & Low-Cost Hack Center
          </h1>
        </div>
        <p className="text-sm text-forest-600">
          Clean Air Delivery Rate (CADR) physics, exponential particulate decay clearance modeling, and
          practical DIY Corsi-Rosenthal blueprints.
        </p>
      </div>

      {/* Smart Ventilation Assistant Banner */}
      <div className="p-5 rounded-2xl bg-white border border-sage-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-sage-100 text-sage-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-sm font-bold text-forest-900">
                Smart Ventilation Status: {ventilationAdvice.action}
              </strong>
              <span className="text-xs px-2 py-0.5 rounded bg-sage-100 text-sage-700 font-semibold">
                {hasValidWeather
                  ? `Ambient AQI ${ventilationAdvice.ambientAQI} • ${selectedZone?.dataOrigin === 'demo' ? 'Demo' : 'Live'}`
                  : 'Outdoor Telemetry Unavailable'}
              </span>
            </div>
            <p className="text-xs text-forest-600 mt-1">{ventilationAdvice.reason}</p>
            <span className="text-[11px] font-semibold text-forest-700 block mt-1">
              Recommended: {ventilationAdvice.recommendedHoursDescription}
            </span>
          </div>
        </div>
      </div>

      {/* Room Tabs & Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Saved Rooms & Selection (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-sage-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-forest-900">Configured Rooms</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-sage-700 hover:text-forest-900"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Room
            </button>
          </div>

          <div className="space-y-2">
            {savedRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => setActiveRoomId(room.id)}
                className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                  room.id === activeRoomId
                    ? 'bg-sage-600 text-white border-sage-600 shadow-xs'
                    : 'bg-warm-bg text-forest-800 border-sage-200 hover:bg-sage-50'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block">{room.name}</span>
                  <span className={`text-[10px] block ${room.id === activeRoomId ? 'text-sage-100' : 'text-forest-500'}`}>
                    {room.lengthM}m × {room.widthM}m • CADR {room.purifierCADR} m³/h
                  </span>
                </div>
                {savedRooms.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSavedRoom(room.id);
                    }}
                    className={`p-1 rounded hover:bg-black/10 ${room.id === activeRoomId ? 'text-white' : 'text-forest-400'}`}
                    aria-label={`Delete ${room.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Room Physical Calculations (8 Cols) */}
        {iaqMetrics && (
          <div className="lg:col-span-8 bg-white rounded-2xl border border-sage-200 p-6 shadow-xs space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-forest-500 uppercase tracking-wider block">
                  Room Fluid Dynamics
                </span>
                <h3 className="text-lg font-bold text-forest-900">{iaqMetrics.roomName}</h3>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full font-bold border ${
                  iaqMetrics.status === 'Optimal' || iaqMetrics.status === 'Adequate'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                Purification Status: {iaqMetrics.status}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-warm-bg rounded-xl border border-sage-200">
                <span className="text-[11px] text-forest-500 block">Room Volume</span>
                <span className="text-base font-bold text-forest-900 font-mono">
                  {iaqMetrics.roomVolumeM3} m³
                </span>
              </div>

              <div className="p-3 bg-warm-bg rounded-xl border border-sage-200">
                <span className="text-[11px] text-forest-500 block">Required CADR</span>
                <span className="text-base font-bold text-forest-900 font-mono">
                  {iaqMetrics.requiredCADR_m3h} m³/h
                </span>
              </div>

              <div className="p-3 bg-warm-bg rounded-xl border border-sage-200">
                <span className="text-[11px] text-forest-500 block">Actual Air Changes</span>
                <span className="text-base font-bold text-sage-700 font-mono">
                  {iaqMetrics.actualACH} ACH
                </span>
              </div>

              <div className="p-3 bg-warm-bg rounded-xl border border-sage-200">
                <span className="text-[11px] text-forest-500 block">CADR Deficit</span>
                <span className="text-base font-bold text-amber-700 font-mono">
                  {iaqMetrics.cadrDeficit_m3h} m³/h
                </span>
              </div>
            </div>

            {/* Clearance Time First-Order Decay */}
            <div className="p-4 bg-sage-50/70 rounded-xl border border-sage-200 text-xs space-y-2">
              <strong className="text-forest-900 font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sage-600" />
                First-Order Particle Decay Clearance Estimates
              </strong>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>
                  Time to 80% indoor PM2.5 reduction:{' '}
                  <strong className="font-mono text-forest-900">
                    {iaqMetrics.clearanceTime80PercentMinutes} minutes
                  </strong>
                </div>
                <div>
                  Time to 95% complete clearance:{' '}
                  <strong className="font-mono text-forest-900">
                    {iaqMetrics.clearanceTime95PercentMinutes} minutes
                  </strong>
                </div>
              </div>
            </div>

            {iaqMetrics.diyCorsiRosenthalRecommended && (
              <div className="p-4 bg-lavender-50 rounded-xl border border-lavender-200 text-xs space-y-1">
                <span className="font-bold text-forest-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-lavender-700" />
                  Recommendation:
                </span>
                <p className="text-forest-700">
                  This room has a deficit of {iaqMetrics.cadrDeficit_m3h} m³/h. Adding{' '}
                  <strong>{iaqMetrics.corsiRosenthalUnitsNeeded} Corsi-Rosenthal DIY Box Cleaner</strong>{' '}
                  will achieve the optimal 5.0 ACH clean air standard for under ₹4,200.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Practical Corsi-Rosenthal DIY Guide Section */}
      <section className="bg-white rounded-2xl border border-sage-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-sage-200">
          <div>
            <h2 className="text-lg font-bold text-forest-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-sage-600" />
              DIY Corsi-Rosenthal Box Cleaner Construction Blueprint
            </h2>
            <p className="text-xs text-forest-600 mt-0.5">
              Peer-reviewed low-cost air cleaner providing ~580 m³/h CADR (equivalent to a ₹25,000 HEPA unit).
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
            Est. Cost: ~₹4,200 ($50)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-warm-bg border border-sage-200 space-y-2">
            <span className="w-6 h-6 rounded-full bg-sage-600 text-white font-bold flex items-center justify-center text-xs">
              1
            </span>
            <h3 className="text-xs font-bold text-forest-900">Materials</h3>
            <p className="text-xs text-forest-600">
              One 20" box fan, four MERV 13 furnace filters (20"×20"), duct tape, and cardboard shroud.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-warm-bg border border-sage-200 space-y-2">
            <span className="w-6 h-6 rounded-full bg-sage-600 text-white font-bold flex items-center justify-center text-xs">
              2
            </span>
            <h3 className="text-xs font-bold text-forest-900">Filter Box Assembly</h3>
            <p className="text-xs text-forest-600">
              Tape 4 filters into a cube with arrows pointing inward toward the center plenum.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-warm-bg border border-sage-200 space-y-2">
            <span className="w-6 h-6 rounded-full bg-sage-600 text-white font-bold flex items-center justify-center text-xs">
              3
            </span>
            <h3 className="text-xs font-bold text-forest-900">Cardboard Shroud</h3>
            <p className="text-xs text-forest-600">
              Cut a circular cardboard shroud for the fan face to eliminate corner air backflow and boost CFM.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-warm-bg border border-sage-200 space-y-2">
            <span className="w-6 h-6 rounded-full bg-sage-600 text-white font-bold flex items-center justify-center text-xs">
              4
            </span>
            <h3 className="text-xs font-bold text-forest-900">Maintenance</h3>
            <p className="text-xs text-forest-600">
              Replace filters every 6 months during winter smog season. Vacuum outer dust pre-filter layer monthly.
            </p>
          </div>
        </div>

        {/* Scientific Anti-Pseudoscience Notice */}
        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>
            <strong>Scientific Note on Indoor Plants: </strong>
            While houseplants contribute to psychological well-being, scientific studies (including EPA and
            Drexel University meta-analyses) demonstrate that potted plants do not significantly remove fine particulate
            matter (PM2.5) or replace mechanical ventilation and MERV 13 filtration.
          </span>
        </div>
      </section>

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateRoom}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-sage-200 space-y-4"
          >
            <h3 className="text-base font-bold text-forest-900">Add New Room Configuration</h3>

            <div>
              <label className="block text-xs font-bold text-forest-800 mb-1">Room Name</label>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="e.g. Home Office, Study, Living Room"
                className="w-full p-2.5 rounded-xl border border-forest-200 text-xs text-forest-900 bg-warm-bg"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-bold text-forest-800 mb-1">Length (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newLength}
                  onChange={(e) => setNewLength(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-forest-200 text-xs text-forest-900 bg-warm-bg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-forest-800 mb-1">Width (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newWidth}
                  onChange={(e) => setNewWidth(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-forest-200 text-xs text-forest-900 bg-warm-bg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-forest-800 mb-1">Height (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newHeight}
                  onChange={(e) => setNewHeight(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-forest-200 text-xs text-forest-900 bg-warm-bg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-forest-800 mb-1">Current Purifier CADR (m³/h)</label>
              <input
                type="number"
                value={newCADR}
                onChange={(e) => setNewCADR(Number(e.target.value))}
                placeholder="0 if no purifier currently present"
                className="w-full p-2.5 rounded-xl border border-forest-200 text-xs text-forest-900 bg-warm-bg"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-forest-600 hover:bg-sage-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-forest-800 text-white text-xs font-semibold hover:bg-forest-900"
              >
                Save Room
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
